"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

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
} satisfies ChartConfig

export function DashboardCharts() {
    const [chartData, setChartData] = React.useState<any[]>([]);

    React.useEffect(() => {
        const data = [
          { month: "January", credits: Math.floor(Math.random() * 500) + 100 },
          { month: "February", credits: Math.floor(Math.random() * 500) + 100 },
          { month: "March", credits: Math.floor(Math.random() * 500) + 100 },
          { month: "April", credits: Math.floor(Math.random() * 500) + 100 },
          { month: "May", credits: Math.floor(Math.random() * 500) + 100 },
          { month: "June", credits: Math.floor(Math.random() * 500) + 100 },
        ]
        setChartData(data);
    }, []);

    if (chartData.length === 0) {
        return null;
    }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Credits Earned</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
                tickLine={false}
                axisLine={false}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="credits" fill="var(--color-credits)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
