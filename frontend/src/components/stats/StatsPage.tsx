import { useState } from "react";
import {
  Flame,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PieChart, Pie, Cell } from "recharts";
import { useWeeklyStreak } from "@/hooks/stats/useWeeklyStreak";
import { useMonthlySessionsCount } from "@/hooks/stats/useMonthlySessionsCount";
import { useClassTypeSplit } from "@/hooks/stats/useClassTypeSplit";
import { useActivityHeatmap } from "@/hooks/stats/useActivityHeatmap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

function StreakCard() {
  const { data, isLoading } = useWeeklyStreak();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Streak</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <Flame className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-3xl font-bold">
                {data?.currentStreak ?? 0}
              </div>
              <div className="text-muted-foreground text-sm">
                {data?.currentStreak === 1 ? "week" : "weeks"} in a row
              </div>
              {data && data.longestStreak > data.currentStreak && (
                <div className="text-muted-foreground text-xs mt-1">
                  Best: {data.longestStreak} weeks
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MonthlySessionsCard() {
  const { data, isLoading } = useMonthlySessionsCount();

  const delta = data ? data.thisMonth - data.lastMonth : 0;
  const deltaPercent =
    data && data.lastMonth > 0 ? Math.round((delta / data.lastMonth) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions This Month</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          <div className="space-y-2">
            <div className="text-3xl font-bold">{data?.thisMonth ?? 0}</div>
            {data && data.lastMonth > 0 && (
              <div className="flex items-center gap-2">
                {delta >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <Badge
                  variant={delta >= 0 ? "default" : "destructive"}
                  className="text-xs"
                >
                  {delta >= 0 ? "+" : ""}
                  {delta} ({deltaPercent >= 0 ? "+" : ""}
                  {deltaPercent}%)
                </Badge>
                <span className="text-muted-foreground text-sm">
                  vs last month
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClassTypeSplitCard() {
  const { data, isLoading } = useClassTypeSplit();

  const giColor = "#2563eb"; // blue-600
  const nogiColor = "#171717"; // neutral-900

  const chartData = data
    ? [
        { name: "Gi", value: data.gi, fill: giColor },
        { name: "No-Gi", value: data.nogi, fill: nogiColor },
      ]
    : [];

  const chartConfig = {
    gi: {
      label: "Gi",
      color: giColor,
    },
    nogi: {
      label: "No-Gi",
      color: nogiColor,
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gi / No-Gi Split</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : data && data.total > 0 ? (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: giColor }}
                />
                <span className="text-muted-foreground">
                  Gi: {data.gi} ({Math.round((data.gi / data.total) * 100)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: nogiColor }}
                />
                <span className="text-muted-foreground">
                  No-Gi: {data.nogi} (
                  {Math.round((data.nogi / data.total) * 100)}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground text-center py-8">
            No training data yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityCalendar() {
  const { data, isLoading } = useActivityHeatmap();
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const viewingDate = new Date(
    today.getFullYear(),
    today.getMonth() - monthOffset,
    1
  );
  const viewingMonth = viewingDate.getMonth();
  const viewingYear = viewingDate.getFullYear();

  const monthName = viewingDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Create a map of date -> count for quick lookup
  const activityMap = new Map<string, number>();
  if (data) {
    for (const item of data.activity) {
      activityMap.set(item.date, item.count);
    }
  }

  // Get days in the viewing month
  const firstDayOfMonth = new Date(viewingYear, viewingMonth, 1);
  const lastDayOfMonth = new Date(viewingYear, viewingMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Build calendar grid (6 weeks max)
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the 1st
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Pad to complete the last week
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  // Group into weeks
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getDateString = (day: number) => {
    const d = new Date(viewingYear, viewingMonth, day);
    return d.toISOString().split("T")[0];
  };

  const getSessionCount = (day: number) => {
    return activityMap.get(getDateString(day)) ?? 0;
  };

  const isToday = (day: number) => {
    return (
      viewingYear === today.getFullYear() &&
      viewingMonth === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isFuture = (day: number) => {
    const d = new Date(viewingYear, viewingMonth, day);
    return d > today;
  };

  // Count sessions in viewing month
  const monthSessionCount = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  ).reduce((sum, day) => sum + getSessionCount(day), 0);

  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const canGoForward = monthOffset > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Training Calendar</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => setMonthOffset(0)}
              disabled={monthOffset === 0}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonthOffset((o) => o + 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-32 text-center">
              {monthName}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setMonthOffset((o) => o - 1)}
              disabled={!canGoForward}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-w-md">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayHeaders.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {weeks.flat().map((day, index) => {
              if (day === null) {
                // eslint-disable-next-line react-x/no-array-index-key
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const count = getSessionCount(day);
              const future = isFuture(day);
              const todayDay = isToday(day);

              return (
                <div
                  key={`day-${day}`}
                  className={`
                    aspect-square rounded flex flex-col items-center justify-center
                    ${future ? "text-muted-foreground/50" : ""}
                    ${todayDay ? "ring-2 ring-primary" : ""}
                    ${
                      count > 0
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-muted/30"
                    }
                  `}
                  title={
                    future
                      ? ""
                      : `${new Date(
                          viewingYear,
                          viewingMonth,
                          day
                        ).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}: ${count} session${count !== 1 ? "s" : ""}`
                  }
                >
                  <span className="text-xs">{day}</span>
                  {count > 0 && (
                    <div className="flex gap-0.5">
                      {Array.from({ length: Math.min(count, 3) }).map(
                        (_, i) => (
                          <div
                            // eslint-disable-next-line react-x/no-array-index-key
                            key={i}
                            className="w-1 h-1 rounded-full bg-green-600 dark:bg-green-400"
                          />
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Month summary */}
          <div className="mt-3 pt-3 border-t flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sessions this month</span>
            <span className="font-semibold">{monthSessionCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stats</h1>
        <p className="text-muted-foreground text-lg">
          View your training analytics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <StreakCard />
        <MonthlySessionsCard />
      </div>

      <ClassTypeSplitCard />
      <ActivityCalendar />
    </div>
  );
}
