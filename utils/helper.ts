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

// https://stackoverflow.com/questions/639695/how-to-convert-latitude-or-longitude-to-meters
// Haversine Formula
export const measureDistance = (
  from: WGS84Coordinates,
  to: WGS84Coordinates
) => {
  var R = 6378.137; // Radius of earth in KM
  var dLat = (+to.latitude * Math.PI) / 180 - (+from.latitude * Math.PI) / 180;
  var dLon =
    (+to.longitude * Math.PI) / 180 - (+from.longitude * Math.PI) / 180;
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((+from.latitude * Math.PI) / 180) *
      Math.cos((+to.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000; // meters
};
