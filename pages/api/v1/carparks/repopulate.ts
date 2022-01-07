import type { NextApiRequest, NextApiResponse } from "next";
import { CarparkView } from "../../../../types/carpark";
import { updateCarparkSheet } from "../../../../utils/sheets";
import { getHdbCarparkInfo, getUraCarparkInfo } from "../../../../utils/api";
import { convertSVY21ToWGS84 } from "../../../../utils/helper";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res.status(500).json({ error: "Only POST requests allowed" });
  }
  try {
    console.log("Fetching HDB carparks");
    const hdbCarparks = await getHdbCarparkInfo({
      limit: 9999,
      q: "",
      offset: 0,
    });

    let result: CarparkView[] = await Promise.all(
      hdbCarparks.carparks.map(async (info) => {
        const svy21Coordinates = { xCoord: info.x_coord, yCoord: info.y_coord };
        const wgs84Coordinates = await convertSVY21ToWGS84(svy21Coordinates);
        return {
          organisation: "HDB",
          carparkNumber: info.car_park_no,
          address: info.address,
          coordinates: [svy21Coordinates],
          carparkType: info.car_park_type,
          typeOfParkingSystem: info.type_of_parking_system,
          shortTermParking: info.short_term_parking,
          nightParking: info.night_parking,
          carparkDecks: info.car_park_decks,
          gantryHeight: info.gantry_height,
          carparkBasement: info.car_park_basement,
          rates: [info.free_parking],
          availability: [],
          latLon: [wgs84Coordinates],
        };
      })
    );

    const uraCarparkInformation = await getUraCarparkInfo();

    let uraCarparks: CarparkView[] = await Promise.all(
      uraCarparkInformation.map(async (info) => {
        const svy21Coordinates =
          info.geometries.length > 0
            ? info.geometries.map((geometry) => {
                const splitCoords = geometry.coordinates.split(",");
                if (splitCoords.length < 2) console.error(info.ppName);
                return {
                  xCoord: splitCoords[0],
                  yCoord: splitCoords[1],
                };
              })
            : [];
        const wgs84Coordinates = await Promise.all(
          svy21Coordinates.map(
            async (svy21) => await convertSVY21ToWGS84(svy21)
          )
        );
        let carparkView: CarparkView = {
          organisation: "URA",
          carparkNumber: info.ppCode,
          address: info.ppName,
          coordinates:
            info.geometries.length > 0
              ? info.geometries.map((geometry) => {
                  const splitCoords = geometry.coordinates.split(",");
                  if (splitCoords.length < 2) console.error(info.ppName);
                  return {
                    xCoord: splitCoords[0],
                    yCoord: splitCoords[1],
                  };
                })
              : [],
          typeOfParkingSystem: info.parkingSystem,
          shortTermParking: `${info.startTime} - ${info.endTime}`,
          nightParking: "URA",
          carparkDecks: 0,
          gantryHeight: 0,
          carparkBasement: "URA, N",
          rates: [
            `WEEKDAYS ${info.weekdayRate} per ${info.weekdayMin}`,
            `SATURDAY ${info.satdayRate} per ${info.satdayMin}`,
            `SUNDAY & PH ${info.sunPHRate} per ${info.sunPHMin}`,
          ],
          availability: [],
          capacity: info.parkCapacity,
          latLon: wgs84Coordinates,
        };

        return carparkView;
      })
    );

    result = [...result, ...uraCarparks];
    await updateCarparkSheet(result);
    res.status(200).json({ result: "success" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
};
