export interface CarparkView {
  organisation: string; // TODO: Change type to const array
  carparkNumber: string;
  address: string;
  coordinates?: {
    xCoord: string;
    yCoord: string;
  }[];
  carparkType?: string;
  typeOfParkingSystem?: string;
  shortTermParking?: string;
  rates: string[];
  nightParking?: string;
  carparkDecks?: number;
  gantryHeight?: number;
  carparkBasement?: string;
  availability: {
    lotType: string;
    lotsAvailable: number;
    totalLots: number;
  }[];
}

export interface CarparkModel {
  organisation: string; // TODO: Change type to const array
  carparkNumber: string;
  address: string;
  coordinates?: string;
  carparkType?: string;
  typeOfParkingSystem: string;
  shortTermParking: string;
  rates: string;
  nightParking: string;
  carparkDecks: number;
  gantryHeight: number;
  carparkBasement: string;
  availability: string;
}
