import axios from "axios";
import dayjs from "dayjs";
import { CarparkView } from "../types/carpark";
import { HDBCarparkAvailability } from "../types/hdb";
import { URACarparkAvailability } from "../types/ura";

const appBaseUrl = "http://localhost:3000";
const apiExtension = "api/v1";

/*
 * All calls here should be client/ client + server side calls
 * Pure server side calls do not belong here
 */

// ---------------- OWN APIs -------------------------
export const getLastUpdated: () => Promise<string> = async () => {
  try {
    const lastUpdated = await axios.get(
      `${appBaseUrl}/${apiExtension}/carparks/lastUpdated`
    );
    return lastUpdated.data;
  } catch (e) {
    console.error(e);
    return "";
  }
};

export const fetchAndPopulateDatabase = async () => {
  try {
    await axios.post(`${appBaseUrl}/${apiExtension}/carparks/repopulate`);
  } catch (e) {
    console.error(e);
  }
};

export const getCarparks: () => Promise<CarparkView[]> = async () => {
  try {
    const res = await axios.get(`${appBaseUrl}/${apiExtension}/carparks`);
    return res.data;
  } catch (e) {
    console.error(e);
    return [];
  }
};

// ---------------- HDB APIs -------------------------
export const getHdbCarparksAvailability: () => Promise<
  HDBCarparkAvailability[]
> = async () => {
  const hdbCarparkAvailabilityUrl =
    "https://api.data.gov.sg/v1/transport/carpark-availability";
  try {
    const res = await axios.get(hdbCarparkAvailabilityUrl, {
      params: { date_time: dayjs().format() },
    });
    return res.data.items[0].carpark_data;
  } catch (e) {
    console.error(e);
  }
};

// ---------------- URA APIs -------------------------
export const getUraToken = async (accessKey: string) => {
  const getUraTokenUrl =
    "https://www.ura.gov.sg/uraDataService/insertNewToken.action";
  try {
    const res = await axios.get(getUraTokenUrl, { headers: { accessKey } });
    return res.data.Result;
  } catch (e) {
    console.error(e);
  }
};

export const getUraCarparksAvailability: (
  accessKey: string,
  token: string
) => Promise<URACarparkAvailability[]> = async (accessKey, token) => {
  const getUraCarparkAvailabilityUrl =
    "https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability";
  try {
    const res = await axios.get(getUraCarparkAvailabilityUrl, {
      headers: { accessKey, token },
    });
    return res.data.Result;
  } catch (e) {
    console.error(e);
    return [];
  }
};
