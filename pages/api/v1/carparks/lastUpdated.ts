import type { NextApiRequest, NextApiResponse } from "next";
import { getLastUpdated } from "../../../../utils/sheets";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    res.status(500).json({ error: "Only GET requests allowed" });
  }
  try {
    const lastUpdated = await getLastUpdated();
    res.status(200).send(lastUpdated);
  } catch (e) {
    console.error(e);
    res.status(500);
  }
};
