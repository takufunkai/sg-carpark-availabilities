import axios from "axios";
import dayjs from "dayjs";
import {
  HDBCarparkAvailability,
  HDBCarparkInformation,
  HDBCarparkInformationParams,
} from "../types/carpark";

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

export const getHdbCarparkInfo: (
  params?: HDBCarparkInformationParams
) => Promise<{ carparks: HDBCarparkInformation[]; total: number }> = async (
  params
) => {
  const hdbCarparkInformationUrl =
    "https://data.gov.sg/api/action/datastore_search?resource_id=139a3035-e624-4f56-b63f-89ae28d4ae4c";
  try {
    const res = await axios.get(hdbCarparkInformationUrl, { params });
    return { carparks: res.data.result.records, total: res.data.result.total };
  } catch (e) {
    console.error(e);
    return { carparks: [], total: 0 };
  }
};

export const getUraToken = async (accessKey: string) => {
  const getUraTokenUrl =
    "https://www.ura.gov.sg/uraDataService/insertNewToken.action";
  try {
    const res = await axios.get(getUraTokenUrl, { headers: { accessKey } });
    return res;
  } catch (e) {
    console.error(e);
  }
};

export const getUraCarparkAvailability = async (
  accessKey: string,
  token: string
) => {
  const getUraCarparkAvailabilityUrl =
    "https://www.ura.gov.sg/uraDataService/invokeUraDS?service=Car_Park_Availability";
  try {
    const res = await axios.get(getUraCarparkAvailabilityUrl, {
      headers: { accessKey, token },
    });
    return res;
  } catch (e) {
    console.error(e);
  }
};