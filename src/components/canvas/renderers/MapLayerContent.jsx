import { Image as KonvaImage } from 'react-konva';

/**
 * Layer 1 — Mapa: imagem de fundo da TW (sempre na base).
 */
export default function MapLayerContent({ mapImage }) {
  if (!mapImage) {
    return null;
  }

  return (
    <KonvaImage
      image={mapImage}
      x={0}
      y={0}
      perfectDrawEnabled={false}
      imageSmoothingEnabled={true}
    />
  );
}
