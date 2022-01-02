import axios from "axios";
import { SVY21Coordinates, WGS84Coordinates } from "../types/common";

export const CarparkLotTypes = ["C", "H", "Y", "M"] as const;
export type CarparkLotType = typeof CarparkLotTypes[number];

export const LotTypeToLabelMap = {
  C: "Car",
  H: "Heavy vehicles",
  Y: "Motorcycles",
  M: "Motorcycles",
};

const oneMapApi = "https://developers.onemap.sg/commonapi/convert/";

export const convertSVY21ToWGS84: (
  from: SVY21Coordinates
) => Promise<WGS84Coordinates> = async (from) => {
  try {
    const res = await axios.get(
      `${oneMapApi}3414to4326?X=${from.xCoord}&Y=${from.yCoord}`
    );
    return res.data;
  } catch (e) {
    console.error(e);
    return {};
  }
};
