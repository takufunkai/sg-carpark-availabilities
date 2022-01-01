export interface HDBCarparkAvailability {
  carpark_number: string;
  carpark_info: {
    lot_type: string;
    lots_available: number;
    total_lots: number;
  }[];
}

export interface HDBCarparkInformation {
  car_park_no: string;
  address: string;
  x_coord: string;
  y_coord: string;
  car_park_type: string;
  type_of_parking_system: string;
  short_term_parking: string;
  free_parking: string;
  night_parking: string;
  car_park_decks: number;
  gantry_height: number;
  car_park_basement: string;
}

export interface HDBCarparkInformationParams {
  q: string | string[];
  limit: number;
  offset: number;
}
