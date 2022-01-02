import styles from "./Map.module.scss";
import { useRef, useState, useEffect } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from "mapbox-gl";
import { WGS84Coordinates } from "../types/common";

interface MapProps {
  carparkCoordinates: WGS84Coordinates[];
}

const Map = ({ carparkCoordinates }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [lng, setLng] = useState(103.8994634835394);
  const [lat, setLat] = useState(1.3884031811248507);
  const [zoom, setZoom] = useState(15);
  const [pointsLoaded, setPointsLoaded] = useState(false);
  const [layerDone, setLayerDone] = useState(false);

  mapboxgl.accessToken = process.env.mapboxGlAccessKey!;

  useEffect(() => {
    console.log("Render1");
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current ?? "",
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });
  }, [map.current]);

  useEffect(() => {
    if (pointsLoaded) return;
    console.log("Render2");
    if (!map.current || !carparkCoordinates) return;
    const features = carparkCoordinates.map((coord) => ({
      type: "Feature" as "Feature",
      geometry: {
        type: "Point" as "Point",
        coordinates: [+coord.longitude, +coord.latitude],
      },
      properties: {
        title: "Testing",
      },
    }));
    map.current.on("load", () => {
      map.current!.loadImage("/custom_marker.png", (error, image) => {
        if (error) throw error;
        map.current!.addImage("custom-marker", image!);
        map.current!.addSource("points", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: features,
          },
        });
      });
      setTimeout(() => {
        console.log("hello");
        console.log(map.current!.getSource("points"));
        map.current!.addLayer({
          id: "points",
          type: "symbol",
          source: "points",
          layout: {
            "icon-image": "custom-marker",
            "text-field": ["get", "title"],
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 1.25],
            "text-anchor": "top",
          },
        });
        console.log(map.current!.getLayer("points"));
      }, 5000);
    });
    setPointsLoaded(true);
  }, [carparkCoordinates]);

  useEffect(() => {
    console.log("Render3");
    if (!map.current) return; // wait for map to initialize
    map.current.on("move", () => {
      setLng(+map.current!.getCenter().lng.toFixed(4));
      setLat(+map.current!.getCenter().lat.toFixed(4));
      setZoom(+map.current!.getZoom().toFixed(2));
    });
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        alignContent: "center",
      }}
    >
      <div className={styles.sidebar}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer ?? ""} className={styles.mapContainer} />
    </div>
  );
};
export default Map;
