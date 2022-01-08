import React, { useEffect } from "react";
import Map from "../components/Map";
import { CarparkAvailability } from "../types/carpark";
import {
  getHdbCarparksAvailability,
  getUraCarparksAvailability,
  getUraToken,
} from "../utils/api";
import Sidebar from "../components/sidebar";
import { useStore } from "../utils/store";

export interface AvailabilityHashMap {
  [carparkNumber: string]: CarparkAvailability[];
}

export const getStaticProps = async () => {
  let availabilities: AvailabilityHashMap = {};

  try {
    const hdbCarparkAvailability = await getHdbCarparksAvailability();
    hdbCarparkAvailability.reduce((map, obj) => {
      const availabilities: CarparkAvailability[] = obj.carpark_info.map(
        (info) => ({
          lotType: info.lot_type,
          lotsAvailable: info.lots_available,
          totalLots: info.total_lots,
        })
      );
      if (map[obj.carpark_number]) {
        map[obj.carpark_number] = [
          ...map[obj.carpark_number],
          ...availabilities,
        ];
      } else {
        map[obj.carpark_number] = availabilities;
      }
      return map;
    }, availabilities as Record<string, CarparkAvailability[]>);

    const uraToken = await getUraToken(process.env.uraAccessKey!);
    const uraCarparkAvailability = await getUraCarparksAvailability(
      process.env.uraAccessKey!,
      uraToken
    );
    uraCarparkAvailability.reduce((map, obj) => {
      const availability = {
        lotType: obj.lotType,
        lotsAvailable: obj.lotsAvailable,
      };
      if (map[obj.carparkNo]) {
        map[obj.carparkNo] = [...map[obj.carparkNo], availability];
      } else {
        map[obj.carparkNo] = [availability];
      }
      return map;
    }, availabilities as Record<string, CarparkAvailability[]>);
  } catch (e) {
    console.error(e);
  }
  return {
    props: { availabilities },
    revalidate: 30,
  };
};

interface HomeProps {
  availabilities: AvailabilityHashMap;
}

const Home: React.FC<HomeProps> = ({ availabilities }) => {
  const { fetchCarparks, setCurrentLocation } = useStore((state) => ({
    fetchCarparks: state.fetchCarparks,
    setCurrentLocation: state.setCurrentLocation,
  }));

  const fetchAndSetCarparks = React.useCallback(async () => {
    try {
      await fetchCarparks(availabilities);
      setCurrentLocation();
    } catch (e) {
      console.error(e);
    }
  }, [availabilities]);

  useEffect(() => {
    fetchAndSetCarparks();
  }, []);

  return (
    <div>
      <Map />
      <Sidebar />
    </div>
  );
};

export default Home;
