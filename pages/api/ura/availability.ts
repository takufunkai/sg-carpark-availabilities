import type { NextApiRequest, NextApiResponse } from "next";
import { getUraToken, getUraCarparkAvailability } from "../../../utils/api";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  // I need accessKey
  try {
    if (!process.env.accessKey) {
      res.status(500).json({ Error: "Failed to find URA AccessKey" });
      return;
    }

    const tokenResponse = await getUraToken(process.env.accessKey);
    if (!tokenResponse) {
      res
        .status(500)
        .json({ Error: "Unexpected error: unable to retrieve token response" });
      return;
    }
    const token = tokenResponse.data.Result;

    const carparkAvailabilityResponse = await getUraCarparkAvailability(
      process.env.accessKey,
      token
    );

    if (!carparkAvailabilityResponse) {
      res.status(500).json({
        Error:
          "Unexpected error: unable to retrieve carpark availability response",
      });
      return;
    }

    const response = carparkAvailabilityResponse.data.Result;
    if (!response) {
      res.status(500).json({
        Error:
          "Unexpected error: unable to retrieve carpark availability response",
      });
      return;
    }

    res.status(200).json(response);
  } catch (e) {
    res.status(500).json({ Error: "Something happened" + e });
  }

  // I need token

  // Make the api call and return the result
};
