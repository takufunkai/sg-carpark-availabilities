import type { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({ status: "testing" });
};

export interface HDBCarparkAvailability {
  carpark_number: string;
  carpark_info: {
    lot_type: string;
    lots_available: number;
    total_lots: number;
  }[];
}
