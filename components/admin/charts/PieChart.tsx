"use client";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  data: number[];
  colors?: string[];
  height?: number;
  showLegend?: boolean;
  cutout?: string;
}

const DEFAULT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316",
];

export function PieChart({
  labels,
  data,
  colors,
  height = 220,
  showLegend = true,
  cutout = "65%",
}: PieChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const textColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const palette = colors ?? DEFAULT_COLORS;

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: palette.map((c) => `${c}cc`),
        hoverBackgroundColor: palette,
        borderWidth: 2,
        borderColor: isDark ? "#1e1e2e" : "#fff",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout,
    plugins: {
      legend: {
        display: showLegend,
        position: "right" as const,
        labels: {
          color: textColor,
          font: { size: 11 },
          padding: 12,
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
        },
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
  } as const;

  return (
    <div style={{ height }}>
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
