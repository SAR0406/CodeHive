"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, LineChart, Line, AreaChart, Area } from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useTheme } from "next-themes"

const chartConfig = {
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
        // Defer random data generation to client-side only
        const data = [
          { month: "January", desktop: Math.floor(Math.random() * (186 - 50 + 1)) + 50, mobile: Math.floor(Math.random() * (180 - 80 + 1)) + 80 },
          { month: "February", desktop: Math.floor(Math.random() * (205 - 50 + 1)) + 50, mobile: Math.floor(Math.random() * (140 - 70 + 1)) + 70 },
          { month: "March", desktop: Math.floor(Math.random() * (237 - 50 + 1)) + 50, mobile: Math.floor(Math.random() * (190 - 90 + 1)) + 90 },
          { month: "April", desktop: Math.floor(Math.random() * (273 - 50 + 1)) + 50, mobile: Math.floor(Math.random() * (220 - 120 + 1)) + 120 },
          { month: "May", desktop: Math.floor(Math.random() * (209 - 50 + 1)) + 50, mobile: Math.floor(Math.random() * (250 - 130 + 1)) + 130 },
          { month: "June", desktop: Math.floor(Math.random() * (214 - 50 + 1)) + 50, mobile: Math.floor(Math.random() * (280 - 150 + 1)) + 150 },
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
        <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 0,
            }}
        >
            <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
            <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                className="fill-muted-foreground text-xs"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <defs>
                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
                </linearGradient>
            </defs>
            <Area
                dataKey="desktop"
                type="natural"
                fill="url(#fillDesktop)"
                stroke="var(--color-desktop)"
                stackId="a"
            />
             <Area
                dataKey="mobile"
                type="natural"
                fill="url(#fillMobile)"
                stroke="var(--color-mobile)"
                stackId="a"
            />
        </AreaChart>
    </ChartContainer>
  )
}
