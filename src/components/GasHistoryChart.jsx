import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function GasHistoryChart({ history }) {
  return (
    <div className="gas-history-chart">
      {/*<h3>Gas behavior over time</h3>*/}

      <LineChart
        width={1200}
        height={350}
        data={history}
        margin={{
          top: 4,
          right: 10,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid
          strokeDasharray="15 12" 
          opacity={1} 
          vertical={false}
          stroke='#00000027'
          strokeWidth={1} 
        />

        <XAxis
          dataKey="time"
          niceTicks="snap125"
          label={{
            value: "",          //Time (s)
            position: "insideBottom",
            offset: -10,
          }}
          tick={false}
        />

        <YAxis
          yAxisId="left"
          niceTicks="snap125"
          label={{
            value: "Temperature (°C)",
            angle: -90,
            position: "left",
            offset: 0,
            textAnchor: 'start',
          }}
        />

        <YAxis
          yAxisId="right"
          niceTicks="snap125"
          orientation="right"
          label={{
            value: "Pressure (hPa)",
            angle: 90,
            position: "right",
            offset: 0,
            textAnchor: 'start',
          }}
        />

        <Tooltip 
          formatter={(v) => v.toFixed(2)}
        />
        <Legend />

        <Line
          yAxisId="left"
          type="monotone"
          dataKey="temperature"
          name="Temperature"
          strokeWidth={2.4}
          stroke="#f04545"
          dot={false}
          animationDuration={80}   //ms     

        />

        <Line
          yAxisId="right"
          type="monotone"
          dataKey="pressure"
          name="Pressure"
          strokeWidth={2}
          strokeDasharray="6 6"
          stroke="#041595"
          dot={false}
          animationDuration={80}    //ms
        />
      </LineChart>
    </div>
  );
}