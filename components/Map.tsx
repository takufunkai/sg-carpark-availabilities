import styles from "./Map.module.scss";
import { useRef, useState, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { useStore } from "../utils/store";

mapboxgl.accessToken = process.env.mapboxGlAccessKey!;

const Map = () => {
  const {
    carparks,
    center: { longitude, latitude },
  } = useStore((state) => ({
    carparks: state.carparks,
    center: state.center,
  }));

  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [+longitude, +latitude],
        zoom: 13,
      });
    }
    const map = mapRef.current;
    const features = carparks.flatMap((carpark) =>
      carpark.latLon
        ? carpark.latLon?.map((coord) => ({
            type: "Feature" as "Feature",
            geometry: {
              type: "Point" as "Point",
              coordinates: [+coord.longitude, +coord.latitude],
            },
            properties: {
              title: carpark.address,
              availability: carpark.availability.reduce(
                (prev, curr) =>
                  prev + `${curr.lotType}: ${curr.lotsAvailable} `,
                ""
              ),
            },
          }))
        : []
    );
    if (!features) {
      return;
    }
    map.on("load", () => {
      map.loadImage("/custom_marker.png", (error, image) => {
        if (error) throw error;
        map.addImage("custom-marker", image!);
      });
      map.addSource("points", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: features,
        },
      });
      map.addLayer({
        id: "points",
        type: "symbol",
        source: "points",
        layout: {
          "icon-image": "custom-marker",
          "text-field": [
            "format",
            ["upcase", ["get", "title"]],
            { "font-scale": 0.8 },
            "\n",
            {},
            ["downcase", ["get", "availability"]],
            { "font-scale": 0.7 },
          ],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 1.25],
          "text-anchor": "top",
        },
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [carparks]);

  useEffect(() => {
    if (!mapRef.current) return;
    let map = mapRef.current;
    map.setCenter([+longitude, +latitude]);
    map.setZoom(18);
  }, [longitude, latitude]);

  return (
    <div className={styles.mapDiv}>
      <div ref={mapContainer ?? ""} className={styles.mapContainer} />
    </div>
  );
};
export default Map;
