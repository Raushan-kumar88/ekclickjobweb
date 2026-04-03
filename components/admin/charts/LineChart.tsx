"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    fill?: boolean;
  }[];
  height?: number;
  showLegend?: boolean;
}

const DEFAULT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export function LineChart({ labels, datasets, height = 220, showLegend = false }: LineChartProps) {
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
        borderColor: color,
        backgroundColor: ds.fill !== false ? `${color}18` : "transparent",
        fill: ds.fill !== false,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        borderWidth: 2,
      };
    }),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
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
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { size: 11 } },
        border: { display: false },
        beginAtZero: true,
      },
    },
  } as const;

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  );
}
