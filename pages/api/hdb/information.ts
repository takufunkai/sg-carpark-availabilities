import axios from "axios";
import dayjs from "dayjs";
import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const hdbCarparkInformationUrl =
    "https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c";
  const hdbCarparkAvailabilityUrl =
    "https://api.data.gov.sg/v1/transport/carpark-availability";
  const { params } = req.query;
  try {
    const informationResponse = await axios.get(hdbCarparkInformationUrl, {
      params,
    });
    const carparkInfo: HDBCarparkInformation[] =
      informationResponse.data.result.records;

    //get availability
    const availabilityResponse = await axios.get(hdbCarparkAvailabilityUrl, {
      params: { date_time: dayjs().format() },
    });
    const carparkAvailability: HDBCarparkAvailability[] =
      availabilityResponse.data.items[0].carpark_data;

    // map availability to info
    let result: HDBCarparkView[] = carparkInfo.map((info) => {
      let carparkView: HDBCarparkView = {
        carparkNumber: info.car_park_no,
        address: info.address,
        xCoord: info.x_coord,
        yCoord: info.y_coord,
        carparkType: info.car_park_type,
        typeOfParkingSystem: info.type_of_parking_system,
        shortTermParking: info.short_term_parking,
        nightParking: info.night_parking,
        carparkDecks: info.car_park_decks,
        gantryHeight: info.gantry_height,
        carparkBasement: info.car_park_basement,
        freeParking: info.free_parking,
        availability: [],
      };

      const availability = carparkAvailability.find(
        (availability) => availability.carpark_number === info.car_park_no
      );
      if (!availability) return carparkView;

      carparkView.availability = availability.carpark_info.map(
        (availabilityInfo) => ({
          lotType: availabilityInfo.lot_type,
          lotsAvailable: availabilityInfo.lots_available,
          totalLots: availabilityInfo.total_lots,
        })
      );

      return carparkView;
    });
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
};

interface HDBCarparkView {
  carparkNumber: string;
  address: string;
  xCoord: string;
  yCoord: string;
  carparkType: string;
  typeOfParkingSystem: string;
  shortTermParking: string;
  freeParking: string;
  nightParking: string;
  carparkDecks: number;
  gantryHeight: number;
  carparkBasement: string;
  availability: {
    lotType: string;
    lotsAvailable: number;
    totalLots: number;
  }[];
}

export interface HDBCarparkAvailability {
  carpark_number: string;
  carpark_info: {
    lot_type: string;
    lots_available: number;
    total_lots: number;
  }[];
}

export interface HDBCarparkInformation {
  car_park_no: string;
  address: string;
  x_coord: string;
  y_coord: string;
  car_park_type: string;
  type_of_parking_system: string;
  short_term_parking: string;
  free_parking: string;
  night_parking: string;
  car_park_decks: number;
  gantry_height: number;
  car_park_basement: string;
}
