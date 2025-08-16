"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { useReportStore } from "@/app/pages/store/reportStore";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  Calendar,
  Download,
  Eye,
} from "lucide-react";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--color-chart-1))",
  },
  expense: {
    label: "Expense",
    color: "hsl(var(--color-chart-2))",
  },
  saved: {
    label: "Saved",
    color: "hsl(var(--color-chart-3))",
  },
};

const Report = () => {
  const { data, loading, error, fetchData } = useReportStore();
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              Financial Report
            </h1>
            <p className="text-muted-foreground">
              Loading your financial insights...
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">
                Analyzing your financial data...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Financial Report
          </h1>
          <p className="text-muted-foreground">
            Unable to load your financial data
          </p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Eye className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-destructive">
                  Error Loading Data
                </p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
              <Button onClick={() => fetchData()} variant="outline" size="sm">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Financial Report
          </h1>
          <p className="text-muted-foreground">No financial data available</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No Data Available</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start adding transactions to see your financial report
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = [
    { name: "income", value: data.income, fill: chartConfig.income.color },
    { name: "expense", value: data.expense, fill: chartConfig.expense.color },
    { name: "saved", value: data.saved, fill: chartConfig.saved.color },
  ];

  // Legend payload for the BarChart (trend) so users can see colors and labels
  const barLegendPayload = [
    {
      value: chartConfig.income.label,
      dataKey: "income",
      color: chartConfig.income.color,
    },
    {
      value: chartConfig.expense.label,
      dataKey: "expense",
      color: chartConfig.expense.color,
    },
    {
      value: chartConfig.saved.label,
      dataKey: "saved",
      color: chartConfig.saved.color,
    },
  ];

  const totalIncome = data.income || 0;
  const totalExpenses = data.expense || 0;
  const totalSaved = data.saved || 0;
  const netWorth = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSaved / totalIncome) * 100 : 0;
  const expenseRatio =
    totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Mock data for trend chart
  const trendData = [
    {
      month: "Jan",
      income: totalIncome * 0.8,
      expense: totalExpenses * 0.9,
      saved: totalSaved * 0.7,
    },
    {
      month: "Feb",
      income: totalIncome * 0.9,
      expense: totalExpenses * 0.8,
      saved: totalSaved * 0.8,
    },
    {
      month: "Mar",
      income: totalIncome,
      expense: totalExpenses,
      saved: totalSaved,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Financial Report
          </h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your financial activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="year-to-date">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalIncome.toLocaleString()} ETB
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalExpenses.toLocaleString()} ETB
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -5% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saved</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalSaved.toLocaleString()} ETB
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netWorth >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {netWorth.toLocaleString()} ETB
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={savingsRate >= 20 ? "default" : "secondary"}
                className="text-xs"
              >
                {savingsRate.toFixed(1)}% saved
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Breakdown</CardTitle>
            <CardDescription>
              Distribution of your income, expenses, and savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number, name: string) => {
                      const cfg = chartConfig[name as keyof typeof chartConfig]
                      const color = cfg?.color || undefined
                      const valueStr = `${value.toLocaleString()} ETB`

                      const jsxValue = (
                        <span className="inline-flex items-center gap-2">
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              backgroundColor: color,
                              borderRadius: 2,
                            }}
                          />
                          <span>{valueStr}</span>
                        </span>
                      )

                      return [jsxValue, cfg?.label || name]
                    }}
                  />
                  <ChartLegend
                    content={<ChartLegendContent payload={chartData} />}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>3-Month Trend</CardTitle>
            <CardDescription>
              Track your financial progress over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number, name: string) => {
                      const cfg = chartConfig[name as keyof typeof chartConfig]
                      const color = cfg?.color || undefined
                      const valueStr = `${value.toLocaleString()} ETB`

                      const jsxValue = (
                        <span className="inline-flex items-center gap-2">
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              backgroundColor: color,
                              borderRadius: 2,
                            }}
                          />
                          <span>{valueStr}</span>
                        </span>
                      )

                      return [jsxValue, cfg?.label || name]
                    }}
                  />
                  <ChartLegend
                    content={<ChartLegendContent payload={barLegendPayload} />}
                  />
                  <Bar dataKey="income" fill={chartConfig.income.color} />
                  <Bar dataKey="expense" fill={chartConfig.expense.color} />
                  <Bar dataKey="saved" fill={chartConfig.saved.color} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Insights</CardTitle>
          <CardDescription>
            Key metrics and recommendations for your financial health
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {expenseRatio.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Expense Ratio</div>
              <Badge
                variant={expenseRatio <= 70 ? "default" : "destructive"}
                className="mt-2"
              >
                {expenseRatio <= 70 ? "Healthy" : "High"}
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {savingsRate.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Savings Rate</div>
              <Badge
                variant={savingsRate >= 20 ? "default" : "secondary"}
                className="mt-2"
              >
                {savingsRate >= 20 ? "Excellent" : "Needs Improvement"}
              </Badge>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-primary">
                {totalIncome > 0
                  ? Math.ceil(totalExpenses / (totalIncome / 30))
                  : 0}
              </div>
              <div className="text-sm text-muted-foreground">
                Days of Expenses Covered
              </div>
              <Badge variant="outline" className="mt-2">
                Monthly Budget
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Report;
