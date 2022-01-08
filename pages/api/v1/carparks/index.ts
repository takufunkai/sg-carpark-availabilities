import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { CarparkView } from "../../../../types/carpark";
import { LTACarparkAvailability } from "../../../../types/lta";
import { getCarparkRows } from "../../../../utils/sheets";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const resultHdbUra = await getCarparkRows();
    const resultLtaDataMall = await getLtaCarparksAvailability(
      process.env.ltaAccountKey!
    );
    const resultLtaOnly: CarparkView[] = resultLtaDataMall
      .filter((res) => res.Agency === "LTA")
      .map((res) => ({
        organisation: "LTA",
        carparkNumber: res.CarParkID,
        address: res.Area + " " + res.Development,
        latLon: [
          {
            latitude: res.Location.split(" ")[0],
            longitude: res.Location.split(" ")[1],
          },
        ],
        availability: [
          { lotType: res.LotType, lotsAvailable: res.AvailableLots },
        ],
        rates: [],
      }));
    res.status(200).json([...resultLtaOnly, ...resultHdbUra]);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
};

const getLtaCarparksAvailability: (
  accountKey: string
) => Promise<LTACarparkAvailability[]> = async (accountKey) => {
  const getLtaCarparkAvailabilityUrl =
    "http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2";
  try {
    const res = await axios.get(getLtaCarparkAvailabilityUrl, {
      headers: { accountKey },
    });
    return res.data.value;
  } catch (e) {
    console.error(e);
    return [];
  }
};
