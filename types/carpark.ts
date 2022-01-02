import { SVY21Coordinates, WGS84Coordinates } from "./common";

export interface CarparkAvailability {
  lotType: string;
  lotsAvailable: number;
  totalLots?: number;
}

export interface CarparkView {
  organisation: string; // TODO: Change type to const array
  carparkNumber: string;
  address: string;
  coordinates?: SVY21Coordinates[];
  carparkType?: string;
  typeOfParkingSystem?: string;
  shortTermParking?: string;
  rates: string[];
  nightParking?: string;
  carparkDecks?: number;
  gantryHeight?: number;
  carparkBasement?: string;
  availability: CarparkAvailability[];
  capacity?: number;
  latLon?: WGS84Coordinates[];
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
  capacity: string;
}
