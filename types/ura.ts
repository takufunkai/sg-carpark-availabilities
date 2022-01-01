export interface URACarparkInformation {
  ppCode: string;
  ppName: string;
  vehCat: string;
  startTime: string;
  endTime: string;
  weekdayRate: string;
  weekdayMin: string;
  satdayRate: string;
  satdayMin: string;
  sunPHRate: string;
  sunPHMin: string;
  remarks: string;
  parkingSystem: string;
  parkCapacity: number;
  geometries: { coordinates: string }[];
}

export interface URACarparkAvailability {
  carparkNo: string;
  lotsAvailable: number;
  lotType: string;
}

export interface URAToken {
  token: string;
  date: string;
}
