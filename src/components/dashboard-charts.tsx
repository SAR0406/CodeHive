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
    const [chartData, setChartData] = React.useState([]);

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
             Loading chart...
        );
    }
  
  return (
    
        
            
                
                bottom: 0,
            }}
        >
            
            
                
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                className="fill-muted-foreground text-xs"
            />
            
            
                
                    
                    
                    offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                    
                
                
                    
                    
                    offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                    
                
            
            
                
                
                
                stackId="a"
            />
             
                
                
                
                stackId="a"
            />
        
    
  )
}
