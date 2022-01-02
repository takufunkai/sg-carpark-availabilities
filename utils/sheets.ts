import dayjs from "dayjs";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { CarparkView } from "../types/carpark";

// Config variables
const SPREADSHEET_ID = "16vw0svdQjGynu0bxHrm0gjmiVepNe1DTiAVdXLvltgk";
const CARPARKS_SHEET_TITLE = "Carparks";
const MAIN_SHEET_TITLE = "Main";

const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

const loadDoc = async () => {
  await doc.useServiceAccountAuth({
    client_email: process.env.SHEETS_CLIENT_EMAIL ?? "",
    private_key: process.env.SHEETS_PRIVATE_KEY ?? "",
  });
  // loads document properties and worksheets
  await doc.loadInfo();
};

const CarparkModelHeaderValues = [
  "organisation",
  "carparkNumber",
  "address",
  "coordinates",
  "carparkType",
  "typeOfParkingSystem",
  "shortTermParking",
  "rates",
  "nightParking",
  "carparkDecks",
  "gantryHeight",
  "carparkBasement",
  "availability",
  "capacity",
  "latLon",
];

export const updateCarparkSheet = async (rows: any) => {
  try {
    await loadDoc();
    const oldSheet = doc.sheetsByTitle[CARPARKS_SHEET_TITLE];
    if (oldSheet) {
      await oldSheet.delete();
    }
    const newSheet = await doc.addSheet({
      title: CARPARKS_SHEET_TITLE,
      headerValues: CarparkModelHeaderValues,
    });
    const rowsJson: any = rows.map((carpark: any) => ({
      ...carpark,
      coordinates: JSON.stringify(carpark.coordinates),
      rates: JSON.stringify(carpark.rates),
      availability: JSON.stringify(carpark.availability),
      latLon: JSON.stringify(carpark.latLon),
    }));
    newSheet.addRows(rowsJson);

    const mainSheet = doc.sheetsByTitle[MAIN_SHEET_TITLE];
    await mainSheet.loadCells("A2:A2");
    const lastUpdated = mainSheet.getCell(1, 0);
    lastUpdated.value = dayjs().format();
    await mainSheet.saveUpdatedCells();
    return;
  } catch (e) {
    console.error(e);
  }
};

export const getLastUpdated = async () => {
  try {
    await loadDoc();
    const mainSheet = doc.sheetsByTitle[MAIN_SHEET_TITLE];
    await mainSheet.loadCells("A2:A2");
    const lastUpdatedCell = mainSheet.getCell(1, 0);
    return lastUpdatedCell.value;
  } catch (e) {
    console.error(e);
  }
};

export const getCarparkRows = async (searchFilter?: string[]) => {
  try {
    await loadDoc();
    const carparksSheet = doc.sheetsByTitle[CARPARKS_SHEET_TITLE];
    const rowsJson = await carparksSheet.getRows();
    const rowsJsonFiltered =
      searchFilter && searchFilter.length > 0
        ? rowsJson.filter((rowJson) =>
            searchFilter
              .map((search) =>
                rowJson.address.toLowerCase().includes(search.toLowerCase())
              )
              .reduce((x, y) => x && y)
          )
        : rowsJson;
    const rows: CarparkView[] = rowsJsonFiltered.map((row) => {
      const cpView: CarparkView = {
        organisation: row.organisation,
        carparkNumber: row.carparkNumber,
        address: row.address,
        coordinates: JSON.parse(row.coordinates),
        rates: JSON.parse(row.rates),
        availability: JSON.parse(row.availability),
        capacity: row.capacity,
        latLon: JSON.parse(row.latLon),
      };

      return cpView;
    });
    return rows;
  } catch (e) {
    console.error(e);
    return [];
  }
};
