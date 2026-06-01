import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Group } from 'react-konva';
import { useLayers, usePlanElements } from '../../hooks/useLayers';
import LayerGroup from './LayerGroup';
import '../MapViewer.css';

const MIN_SCALE = 0.05;
const MAX_SCALE = 8;
const ZOOM_FACTOR = 1.12;

/**
 * Canvas principal com sistema de camadas ordenadas.
 * Viewport (pan/zoom) aplica transformação a todas as camadas em conjunto.
 */
export default function MapCanvas({
  imageUrl,
  onImageLoad,
  zoomInRef,
  zoomOutRef,
  resetViewRef,
  onZoomChange,
  onImageError,
}) {
  const { layers } = useLayers();
  const { elements } = usePlanElements();

  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [mapImage, setMapImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  useEffect(() => {
    if (!imageUrl) {
      setMapImage(null);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      setMapImage(img);
      onImageLoad?.({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      setMapImage(null);
      onImageError?.('Não foi possível exibir a imagem do mapa.');
    };
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, onImageLoad, onImageError]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clampPosition = useCallback(
    (pos, currentScale, img) => {
      if (!img) return pos;

      const mapW = img.naturalWidth * currentScale;
      const mapH = img.naturalHeight * currentScale;
      const padding = 80;

      let minX;
      let maxX;
      let minY;
      let maxY;

      if (mapW <= size.width) {
        const centerX = (size.width - mapW) / 2;
        minX = centerX - padding;
        maxX = centerX + padding;
      } else {
        minX = size.width - mapW - padding;
        maxX = padding;
      }

      if (mapH <= size.height) {
        const centerY = (size.height - mapH) / 2;
        minY = centerY - padding;
        maxY = centerY + padding;
      } else {
        minY = size.height - mapH - padding;
        maxY = padding;
      }

      return {
        x: Math.min(maxX, Math.max(minX, pos.x)),
        y: Math.min(maxY, Math.max(minY, pos.y)),
      };
    },
    [size.width, size.height]
  );

  const fitToView = useCallback(
    (img) => {
      if (!img || size.width === 0 || size.height === 0) return;

      const scaleX = size.width / img.naturalWidth;
      const scaleY = size.height / img.naturalHeight;
      const fitScale = Math.min(scaleX, scaleY, 1) * 0.92;
      const clampedScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, fitScale));

      const mapW = img.naturalWidth * clampedScale;
      const mapH = img.naturalHeight * clampedScale;

      setScale(clampedScale);
      setPosition({
        x: (size.width - mapW) / 2,
        y: (size.height - mapH) / 2,
      });
      onZoomChange?.(Math.round(clampedScale * 100));
    },
    [size.width, size.height, onZoomChange]
  );

  useEffect(() => {
    if (mapImage) {
      fitToView(mapImage);
    }
  }, [mapImage, size.width, size.height, fitToView]);

  const applyZoom = useCallback(
    (direction, pointer) => {
      if (!mapImage) return;

      const stage = stageRef.current;
      const oldScale = scale;
      const newScale =
        direction > 0
          ? Math.min(MAX_SCALE, oldScale * ZOOM_FACTOR)
          : Math.max(MIN_SCALE, oldScale / ZOOM_FACTOR);

      if (newScale === oldScale) return;

      const pointerPos = pointer ?? {
        x: size.width / 2,
        y: size.height / 2,
      };

      const mousePointTo = {
        x: (pointerPos.x - position.x) / oldScale,
        y: (pointerPos.y - position.y) / oldScale,
      };

      const newPos = {
        x: pointerPos.x - mousePointTo.x * newScale,
        y: pointerPos.y - mousePointTo.y * newScale,
      };

      const clamped = clampPosition(newPos, newScale, mapImage);
      setScale(newScale);
      setPosition(clamped);
      onZoomChange?.(Math.round(newScale * 100));

      stage?.batchDraw();
    },
    [mapImage, scale, position, size, clampPosition, onZoomChange]
  );

  useEffect(() => {
    if (!zoomInRef) return;
    zoomInRef.current = () => applyZoom(1);
  }, [zoomInRef, applyZoom]);

  useEffect(() => {
    if (!zoomOutRef) return;
    zoomOutRef.current = () => applyZoom(-1);
  }, [zoomOutRef, applyZoom]);

  useEffect(() => {
    if (!resetViewRef) return;
    resetViewRef.current = () => {
      if (mapImage) fitToView(mapImage);
    };
  }, [resetViewRef, mapImage, fitToView]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const pointer = stageRef.current?.getPointerPosition();
    applyZoom(e.evt.deltaY < 0 ? 1 : -1, pointer);
  };

  const handleMouseDown = (e) => {
    if (e.evt.button !== 0) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.evt.clientX,
      y: e.evt.clientY,
      posX: position.x,
      posY: position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !mapImage) return;

    const dx = e.evt.clientX - dragStart.current.x;
    const dy = e.evt.clientY - dragStart.current.y;

    setPosition(
      clampPosition(
        {
          x: dragStart.current.posX + dx,
          y: dragStart.current.posY + dy,
        },
        scale,
        mapImage
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderContext = {
    mapImage,
    elements,
  };

  return (
    <div
      ref={containerRef}
      className={`map-viewer ${isDragging ? 'map-viewer--dragging' : ''}`}
    >
      {!imageUrl && (
        <div className="map-viewer__placeholder">
          <p>Selecione um mapa na barra lateral ou importe uma imagem.</p>
        </div>
      )}

      {imageUrl && (
        <Stage
          ref={stageRef}
          width={size.width}
          height={size.height}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <Layer>
            <Group
              name="viewport"
              x={position.x}
              y={position.y}
              scaleX={scale}
              scaleY={scale}
            >
              {layers.map((layer) => (
                <LayerGroup
                  key={layer.id}
                  layer={layer}
                  renderContext={renderContext}
                />
              ))}
            </Group>
          </Layer>
        </Stage>
      )}
    </div>
  );
}
