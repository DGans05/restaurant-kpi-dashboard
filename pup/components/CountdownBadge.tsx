"use client";

import { useEffect, useState } from "react";

function getCountdownLabel(targetDate: string): string {
  const arrival = new Date(targetDate);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfArrival = new Date(arrival.getFullYear(), arrival.getMonth(), arrival.getDate());
  const diffMs = startOfArrival.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `${diffDays}`;
  if (diffDays === 0) return "🎉";
  return "✓";
}

function getCountdownSub(targetDate: string): string {
  const arrival = new Date(targetDate);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfArrival = new Date(arrival.getFullYear(), arrival.getMonth(), arrival.getDate());
  const diffMs = startOfArrival.getTime() - startOfToday.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return "Dagen tot aankomst";
  if (diffDays === 0) return "Vandaag!";
  return "Al thuis";
}

interface CountdownBadgeProps {
  arrivalDate: string;
}

export default function CountdownBadge({ arrivalDate }: CountdownBadgeProps) {
  const [value, setValue] = useState(() => getCountdownLabel(arrivalDate));
  const [sub, setSub] = useState(() => getCountdownSub(arrivalDate));

  useEffect(() => {
    const tick = () => {
      setValue(getCountdownLabel(arrivalDate));
      setSub(getCountdownSub(arrivalDate));
    };
    tick();
    const interval = window.setInterval(tick, 86_400_000);
    return () => window.clearInterval(interval);
  }, [arrivalDate]);

  return (
    <div className="countdown-card">
      <div className="countdown-value">{value}</div>
      <div className="countdown-label">{sub}</div>
      <div className="countdown-date">
        📅 {new Date(arrivalDate).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "long",
          year: "numeric"
        })}
      </div>
    </div>
  );
}
