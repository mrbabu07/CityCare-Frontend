"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
const colors = [
  "#2c7059",
  "#d0a346",
  "#7794b5",
  "#9c6b93",
  "#98ad76",
  "#b75c5a",
  "#54676d",
];
export default function StatusChart({
  data,
}: {
  data: { name: string; count: number }[];
}) {
  return (
    <div className="chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 12, right: 12, bottom: 6, left: -20 }}
        >
          <CartesianGrid vertical={false} stroke="#edf0ed" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip cursor={{ fill: "#f4f6f4" }} />
          <Bar
            dataKey="count"
            name="Requests"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          >
            {data.map((d, i) => (
              <Cell key={d.name} fill={colors[i % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
