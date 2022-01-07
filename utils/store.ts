import dayjs from "dayjs";
import create from "zustand";
import { AvailabilityHashMap } from "../pages";
import { CarparkView } from "../types/carpark";
import { WGS84Coordinates } from "../types/common";
import { fetchAndPopulateDatabase, getCarparks, getLastUpdated } from "./api";

interface State {
  carparks: CarparkView[];
  filteredCarparks: CarparkView[];
  fetchCarparks: (availabilities: AvailabilityHashMap) => void;
  filterCarparks: (filter: (carpark: CarparkView) => boolean) => void;
  center: WGS84Coordinates;
  setCenter: (center: WGS84Coordinates) => void;
  currentLocation: WGS84Coordinates;
  setCurrentLocation: () => void;
}

export const useStore = create<State>((set, get) => ({
  carparks: [],
  filteredCarparks: [],
  center: { longitude: "103.7729792", latitude: "1.3795328" },
  currentLocation: { longitude: "103.89946", latitude: "1.388403" },
  setCurrentLocation: () => {
    navigator.geolocation.getCurrentPosition((position) =>
      set((state) => ({
        currentLocation: {
          latitude: "" + position.coords.latitude,
          longitude: "" + position.coords.longitude,
        },
      }))
    );
  },
  fetchCarparks: async (availabilities: AvailabilityHashMap) => {
    try {
      const lastUpdated = await getLastUpdated();
      if (dayjs().isAfter(dayjs(lastUpdated as string), "day")) {
        await fetchAndPopulateDatabase();
      }
      const result = await getCarparks();
      const resultWithAvailability = result.map((cp) => ({
        ...cp,
        availability: availabilities[cp.carparkNumber] ?? [],
      }));
      set(() => ({
        carparks: resultWithAvailability,
        filteredCarparks: resultWithAvailability,
      }));
    } catch (e) {
      console.error(e);
    }
  },
  filterCarparks: (filter: (carpark: CarparkView) => boolean) =>
    set((state) => ({
      filteredCarparks: state.carparks.filter(filter),
    })),
  setCenter: (center: WGS84Coordinates) => set((state) => ({ center })),
}));
