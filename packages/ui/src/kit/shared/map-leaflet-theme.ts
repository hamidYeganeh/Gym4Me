/**
 * Shared Leaflet chrome classes that sync the basemap with theme map tokens
 * (`--map-land`, `--map-tile-filter`, … from `@repo/theme`).
 */
export const mapLeafletThemeClasses = [
  "[&_.leaflet-container]:!bg-map-land",
  "[&_.leaflet-tile-pane]:[filter:var(--map-tile-filter)]",
  "[&_.leaflet-control-attribution]:!bg-transparent [&_.leaflet-control-attribution]:!text-[9px]",
  "[&_.leaflet-control-attribution]:!text-muted [&_.leaflet-control-attribution]:!m-1",
  /* Keep marker HTML (pulse rings / distance chips) from being clipped. */
  "[&_.leaflet-marker-icon]:!overflow-visible [&_.coach-map-pin]:!overflow-visible",
  "[&_.coach-map-pin]:!bg-transparent [&_.coach-map-pin]:!border-0",
].join(" ");
