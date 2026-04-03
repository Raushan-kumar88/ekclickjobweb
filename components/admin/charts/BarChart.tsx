"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
  height?: number;
  showLegend?: boolean;
  horizontal?: boolean;
}

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function BarChart({
  labels,
  datasets,
  height = 220,
  showLegend = false,
  horizontal = false,
}: BarChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const textColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  const data = {
    labels,
    datasets: datasets.map((ds, i) => {
      const color = ds.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
      return {
        label: ds.label,
        data: ds.data,
        backgroundColor: `${color}cc`,
        hoverBackgroundColor: color,
        borderRadius: 6,
        borderSkipped: false,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: horizontal ? ("y" as const) : ("x" as const),
    plugins: {
      legend: {
        display: showLegend,
        labels: { color: textColor, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: isDark ? "#1e1e2e" : "#fff",
        borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        borderWidth: 1,
        titleColor: isDark ? "#fff" : "#000",
        bodyColor: textColor,
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { color: horizontal ? gridColor : "transparent" },
        ticks: { color: textColor, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: horizontal ? "transparent" : gridColor },
        ticks: { color: textColor, font: { size: 11 } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  } as const;

  return (
    <div style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
}
