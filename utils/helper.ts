export const CarparkLotTypes = ["C", "H", "Y"] as const;
export type CarparkLotType = typeof CarparkLotTypes[number];

export const LotTypeToLabelMap = {
  C: "Car",
  H: "Heavy vehicles",
  Y: "Motorcycles",
};
