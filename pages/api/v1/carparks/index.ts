import type { NextApiRequest, NextApiResponse } from "next";
import { getCarparkRows } from "../../../../utils/sheets";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { search } = req.query;
    let searchParams: string[] = [];
    if (search) {
      searchParams = (search as string).split(",");
    }
    const result = await getCarparkRows(searchParams);
    res.status(200).json(result);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
};
