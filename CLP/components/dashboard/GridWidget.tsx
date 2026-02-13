"use client";

import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

const WIDGET_TYPE = "DASHBOARD_WIDGET";

interface GridWidgetProps {
  id: string;
  index: number;
  onMoveItem: (sourceId: string, destinationId: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function GridWidget({ id, index, onMoveItem, children, className }: GridWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, connectDrag] = useDrag({
    type: WIDGET_TYPE,
    item: { id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, connectDrop] = useDrop({
    accept: WIDGET_TYPE,
    hover(hoveredOverItem: { id: string }) {
      if (hoveredOverItem.id !== id) {
        onMoveItem(hoveredOverItem.id, id);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  connectDrag(ref);
  connectDrop(ref);

  return (
    <div
      ref={ref}
      style={{ order: index }}
      className={`cursor-grab transition-all duration-200 active:cursor-grabbing ${
        isDragging ? "scale-[0.97] opacity-40" : "opacity-100"
      } ${
        isOver && !isDragging ? "ring-2 ring-primary/30 ring-offset-2 rounded-2xl" : ""
      } ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
