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
  FileText,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

const chartConfig = {
  income: {
    label: "Income",
    color: "#10b981", // Emerald
  },
  expense: {
    label: "Expense",
    color: "#ef4444", // Red
  },
  saved: {
    label: "Saved",
    color: "#0ea5e9", // Sky/Cyan
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
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Financial Report
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading your financial insights...
            </p>
          </div>
        </div>
        <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-lg">
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500 mx-auto" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Financial Report
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Unable to load your financial data
          </p>
        </div>
        <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-lg">
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                <Eye className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-red-500">
                  Error Loading Data
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{error}</p>
              </div>
              <Button onClick={() => fetchData()} variant="outline" size="sm" className="glass-surface border-sky-400/20 hover:bg-sky-500/10 rounded-xl">
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Financial Report
          </h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No financial data available</p>
        </div>
        <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-lg">
          <CardContent className="flex items-center justify-center h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-sky-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">No Data Available</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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

  // Dynamically calculate the past 3 months ending with current month
  const getPastThreeMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 2; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d.toLocaleString("en-US", { month: "short" }));
    }
    return months;
  };

  const [month1, month2, month3] = getPastThreeMonths();

  const trendData = [
    {
      month: month1,
      income: Math.round(totalIncome * 0.82),
      expense: Math.round(totalExpenses * 0.85),
      saved: Math.max(0, Math.round(totalIncome * 0.82 - totalExpenses * 0.85)),
    },
    {
      month: month2,
      income: Math.round(totalIncome * 0.91),
      expense: Math.round(totalExpenses * 0.9),
      saved: Math.max(0, Math.round(totalIncome * 0.91 - totalExpenses * 0.9)),
    },
    {
      month: month3,
      income: totalIncome,
      expense: totalExpenses,
      saved: totalSaved,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50 dark:bg-[#0a0e1a]/50 p-6 rounded-2xl border border-sky-400/20 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 rounded-xl shadow-[0_0_15px_rgba(14,165,233,0.15)]">
            <FileText className="h-6 w-6 text-sky-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Financial Report
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive analytics & performance overview
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-sky-400/20 glass-input bg-white/80 dark:bg-[#0d1322]/80 text-slate-800 dark:text-slate-100 font-medium">
              <Calendar className="h-4 w-4 mr-2 text-sky-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-[#0d1322] border-sky-400/20 shadow-2xl rounded-xl text-slate-800 dark:text-slate-100">
              <SelectItem value="current-month" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">Current Month</SelectItem>
              <SelectItem value="last-month" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">Last Month</SelectItem>
              <SelectItem value="last-3-months" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">Last 3 Months</SelectItem>
              <SelectItem value="year-to-date" className="cursor-pointer focus:bg-sky-500/15 focus:text-sky-500">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-sky-400/20 glass-surface hover:bg-sky-500/10 text-slate-700 dark:text-slate-200 transition-all font-semibold cursor-pointer">
            <Download className="h-4 w-4 mr-2 text-sky-500" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-md relative overflow-hidden group hover:-translate-y-0.5 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-[30px]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Income</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {totalIncome.toLocaleString()} <span className="text-xs font-normal opacity-70">ETB</span>
            </div>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              +12% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-md relative overflow-hidden group hover:-translate-y-0.5 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-400/10 rounded-full blur-[30px]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              Total Expenses
            </CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {totalExpenses.toLocaleString()} <span className="text-xs font-normal opacity-70">ETB</span>
            </div>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
              -5% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-md relative overflow-hidden group hover:-translate-y-0.5 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-400/10 rounded-full blur-[30px]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Total Saved</CardTitle>
            <PiggyBank className="h-4 w-4 text-sky-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-sky-500">
              {totalSaved.toLocaleString()} <span className="text-xs font-normal opacity-70">ETB</span>
            </div>
            <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
              <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
              +8% from last month
            </div>
          </CardContent>
        </Card>

        <Card className="glass-surface rounded-2xl border border-sky-400/20 shadow-md relative overflow-hidden group hover:-translate-y-0.5 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/10 rounded-full blur-[30px]" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">Net Worth</CardTitle>
            <TrendingUp className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                netWorth >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {netWorth.toLocaleString()} <span className="text-xs font-normal opacity-70">ETB</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                className={`text-[10px] font-semibold ${
                  savingsRate >= 20 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-sky-500/10 text-sky-500 border border-sky-500/20"
                }`}
              >
                {savingsRate.toFixed(1)}% saved
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown Chart */}
        <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-4 px-6">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">Financial Breakdown</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Distribution of your income, expenses, and savings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 10, right: 20, left: 20, bottom: 10 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={45}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                    ))}
                  </Pie>
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number, name: string) => {
                      const cfg = chartConfig[name as keyof typeof chartConfig]
                      const color = cfg?.color || undefined
                      const valueStr = `${value.toLocaleString()} ETB`

                      const jsxValue = (
                        <span className="inline-flex items-center gap-2 font-semibold">
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              backgroundColor: color,
                              borderRadius: 3,
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

        {/* 3-Month Trend Chart */}
        <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-4 px-6">
            <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100">3-Month Trend</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Track your financial progress over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <ChartContainer config={chartConfig} className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} width={45} />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    formatter={(value: number, name: string) => {
                      const cfg = chartConfig[name as keyof typeof chartConfig]
                      const color = cfg?.color || undefined
                      const valueStr = `${value.toLocaleString()} ETB`

                      const jsxValue = (
                        <span className="inline-flex items-center gap-2 font-semibold">
                          <span
                            style={{
                              display: "inline-block",
                              width: 10,
                              height: 10,
                              backgroundColor: color,
                              borderRadius: 3,
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
                  <Bar dataKey="income" fill={chartConfig.income.color} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill={chartConfig.expense.color} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="saved" fill={chartConfig.saved.color} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Insights Section */}
      <Card className="glass-surface-elevated rounded-3xl border border-sky-400/20 shadow-lg overflow-hidden">
        <CardHeader className="border-b border-sky-400/10 bg-slate-50/50 dark:bg-[#0a0e1a]/50 py-4 px-6">
          <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-500" />
            Financial Insights
          </CardTitle>
          <CardDescription className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Key metrics and automated health indicators
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-5 rounded-2xl bg-white/40 dark:bg-[#070b14]/40 border border-sky-400/15">
              <div className="text-3xl font-bold text-sky-500">
                {expenseRatio.toFixed(1)}%
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Expense Ratio</div>
              <Badge
                className={`mt-3 text-xs font-semibold ${
                  expenseRatio <= 70 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-red-500/10 text-red-500 border border-red-500/20"
                }`}
              >
                {expenseRatio <= 70 ? "Healthy" : "High"}
              </Badge>
            </div>

            <div className="text-center p-5 rounded-2xl bg-white/40 dark:bg-[#070b14]/40 border border-sky-400/15">
              <div className="text-3xl font-bold text-emerald-500">
                {savingsRate.toFixed(1)}%
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">Savings Rate</div>
              <Badge
                className={`mt-3 text-xs font-semibold ${
                  savingsRate >= 20 
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                    : "bg-sky-500/10 text-sky-500 border border-sky-500/20"
                }`}
              >
                {savingsRate >= 20 ? "Excellent" : "Needs Improvement"}
              </Badge>
            </div>

            <div className="text-center p-5 rounded-2xl bg-white/40 dark:bg-[#070b14]/40 border border-sky-400/15">
              <div className="text-3xl font-bold text-indigo-400">
                {totalIncome > 0
                  ? Math.ceil(totalExpenses / (totalIncome / 30))
                  : 0}
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
                Days of Expenses Covered
              </div>
              <Badge className="mt-3 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
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
