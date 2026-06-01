import { useCallback, useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import './MapViewer.css';

const MIN_SCALE = 0.05;
const MAX_SCALE = 8;
const ZOOM_FACTOR = 1.12;

/**
 * Visualizador de mapa com Konva.js.
 * FUTURE: Layer de esquadrões arrastáveis (Konva.Group por unidade).
 * FUTURE: Layer de objetivos, setas (Konva.Arrow) e marcadores (Konva.Label).
 * FUTURE: Sincronização multiplayer via eventos Socket.IO aplicados neste stage.
 */
export default function MapViewer({
  imageUrl,
  onImageLoad,
  zoomInRef,
  zoomOutRef,
  resetViewRef,
  onZoomChange,
  onImageError,
}) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  useEffect(() => {
    if (!imageUrl) {
      setImage(null);
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      setImage(img);
      onImageLoad?.({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => {
      setImage(null);
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
    if (image) {
      fitToView(image);
    }
  }, [image, size.width, size.height, fitToView]);

  const applyZoom = useCallback(
    (direction, pointer) => {
      if (!image) return;

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

      const clamped = clampPosition(newPos, newScale, image);
      setScale(newScale);
      setPosition(clamped);
      onZoomChange?.(Math.round(newScale * 100));

      if (stage) {
        stage.batchDraw();
      }
    },
    [image, scale, position, size, clampPosition, onZoomChange]
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
      if (image) fitToView(image);
    };
  }, [resetViewRef, image, fitToView]);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;

    const pointer = stage.getPointerPosition();
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
    if (!isDragging || !image) return;

    const dx = e.evt.clientX - dragStart.current.x;
    const dy = e.evt.clientY - dragStart.current.y;

    const newPos = clampPosition(
      {
        x: dragStart.current.posX + dx,
        y: dragStart.current.posY + dy,
      },
      scale,
      image
    );

    setPosition(newPos);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
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
          <Layer listening={false}>
            {image && (
              <KonvaImage
                image={image}
                x={position.x}
                y={position.y}
                scaleX={scale}
                scaleY={scale}
                perfectDrawEnabled={false}
                imageSmoothingEnabled={true}
              />
            )}
          </Layer>

          {/*
            FUTURE: <Layer name="annotations"> — setas, marcadores, zonas.
            FUTURE: <Layer name="squads"> — grupos arrastáveis com hit detection.
          */}
        </Stage>
      )}
    </div>
  );
}
