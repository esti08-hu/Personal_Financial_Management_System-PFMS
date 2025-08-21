"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"
import apiClient from "@/app/lib/axiosConfig"

interface AccountData {
  name: string
  value: number
  percentage: number
  color: string
}

const chartConfig = {
  active: {
    label: "Active",
    color: "hsl(var(--chart-1))",
  },
  unverified: {
    label: "Unverified",
    color: "hsl(var(--chart-2))",
  },
  locked: {
    label: "Locked",
    color: "hsl(var(--chart-3))",
  },
  inactive: {
    label: "Inactive",
    color: "hsl(var(--chart-4))",
  },
}

const ChartThree = () => {
  const [data, setData] = useState<AccountData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activeRes, inactiveRes, unverifiedRes, lockedRes, totalRes] = await Promise.all([
          apiClient.get("/user/count/active-accounts"),
          apiClient.get("/user/count/inactive-accounts"),
          apiClient.get("/user/count/unverified-accounts"),
          apiClient.get("/user/count/locked-accounts"),
          apiClient.get("/user/count/total-accounts"),
        ])

        const total = totalRes.data
        if (total > 0) {
          const accountData: AccountData[] = [
            {
              name: "active",
              value: activeRes.data,
              percentage: (activeRes.data / total) * 100,
              color: "hsl(var(--chart-1))",
            },
            {
              name: "unverified",
              value: unverifiedRes.data,
              percentage: (unverifiedRes.data / total) * 100,
              color: "hsl(var(--chart-2))",
            },
            {
              name: "locked",
              value: lockedRes.data,
              percentage: (lockedRes.data / total) * 100,
              color: "hsl(var(--chart-3))",
            },
            {
              name: "inactive",
              value: inactiveRes.data,
              percentage: (inactiveRes.data / total) * 100,
              color: "hsl(var(--chart-4))",
            },
          ]
          setData(accountData)
        }
      } catch (error) {
        console.error("Error fetching account data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account Analytics</CardTitle>
          <CardDescription>Loading account data...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Analytics</CardTitle>
        <CardDescription>Distribution of user account statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={120} paddingAngle={2} dataKey="value">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  `${value} users (${data.find((d) => d.name === name)?.percentage.toFixed(1)}%)`,
                  chartConfig[name as keyof typeof chartConfig]?.label || name,
                ]}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export default ChartThree
