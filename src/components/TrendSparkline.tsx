"use client";

import React, { memo } from "react";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Line,
  LineChart,
} from "recharts";
import { TimeSeriesPoint } from "@/types/climate";

interface TrendSparklineProps {
  data: TimeSeriesPoint[];
  color?: string;
  height?: number;
  showAxes?: boolean;
}

const TrendSparkline = memo(function TrendSparkline({
  data,
  color = "#60a5fa",
  height = 80,
  showAxes = false,
}: TrendSparklineProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{ top: 4, right: 4, bottom: 4, left: showAxes ? 24 : 4 }}
      >
        {showAxes && (
          <>
            <XAxis
              dataKey="year"
              tick={{ fill: "var(--color-muted)", fontSize: 10, fontWeight: "bold" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-hairline)" }}
              tickFormatter={(v) => (v % 5 === 0 ? v : "")}
            />
            <YAxis
              tick={{ fill: "var(--color-muted)", fontSize: 10, fontWeight: "bold" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-hairline)" }}
              width={30}
            />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--color-paper)",
            border: "1px solid var(--color-hairline)",
            borderRadius: "0px",
            color: "var(--color-ink)",
            fontSize: "12px",
            fontWeight: "bold",
            boxShadow: "none",
          }}
          labelStyle={{ color: "var(--color-muted)" }}
          formatter={(value) => [Number(value).toFixed(2), "Index"]}
          labelFormatter={(label) => `Year: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="index"
          stroke="var(--color-ink)"
          strokeWidth={2}
          dot={false}
          activeDot={{
            r: 4,
            fill: "var(--color-ink)",
            stroke: "var(--color-paper)",
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
});

export default TrendSparkline;
