"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  credits: {
    label: "Credits",
    color: "hsl(var(--primary))",
  },
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function DashboardCharts() {
    const [chartData, setChartData] = React.useState<any[]>([]);

    React.useEffect(() => {
        const data = [
          { month: "January", desktop: Math.floor(Math.random() * 200) + 50, mobile: Math.floor(Math.random() * 200) + 50},
          { month: "February", desktop: Math.floor(Math.random() * 200) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
          { month: "March", desktop: Math.floor(Math.random() * 200) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
          { month: "April", desktop: Math.floor(Math.random() * 200) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
          { month: "May", desktop: Math.floor(Math.random() * 200) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
          { month: "June", desktop: Math.floor(Math.random() * 200) + 50, mobile: Math.floor(Math.random() * 200) + 50 },
        ]
        setChartData(data);
    }, []);

    if (chartData.length === 0) {
        return (
             <div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading chart...</div>
        );
    }
  
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
        <LineChart
        accessibilityLayer
        data={chartData}
        margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
        }}
        >
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-white/10" />
        <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
            className="fill-muted-foreground"
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
        <Line
            dataKey="desktop"
            type="natural"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={false}
        />
        <Line
            dataKey="mobile"
            type="natural"
            stroke="var(--color-mobile)"
            strokeWidth={2}
            dot={false}
        />
        </LineChart>
    </ChartContainer>
  )
}
