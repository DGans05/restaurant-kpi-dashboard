"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { panelStyles } from "@/lib/utils/styles";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LabourChart } from "@/components/dashboard/LabourChart";
import { WorkedHoursChart } from "@/components/dashboard/WorkedHoursChart";
import { MakeTimeChart } from "@/components/dashboard/MakeTimeChart";
import type {
  ChartDataPoint,
  WorkedHoursDataPoint,
  MakeTimeDataPoint,
} from "@/lib/types";

const tabListClass = "mb-4 bg-[#EDE8DF] rounded-[20px] p-1 h-auto";
const tabTriggerClass =
  "rounded-[20px] text-[14px] font-sans font-normal text-[rgba(29,37,50,0.6)] data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-[#FFF6E9] data-[state=active]:shadow-sm";

interface ChartsPanelProps {
  chartData: ChartDataPoint[];
  workedHoursData?: WorkedHoursDataPoint[];
  makeTimeData?: MakeTimeDataPoint[];
}

export function ChartsPanel({
  chartData,
  workedHoursData,
  makeTimeData,
}: ChartsPanelProps) {
  const hasWorkedHours = workedHoursData && workedHoursData.length > 0;
  const hasMakeTime = makeTimeData && makeTimeData.length > 0;

  return (
    <div className="animate-fade-up grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Revenue / Worked Hours */}
      <div className={`${panelStyles} p-5`}>
        {hasWorkedHours ? (
          <Tabs defaultValue="revenue">
            <TabsList className={tabListClass}>
              <TabsTrigger value="revenue" className={tabTriggerClass}>Omzet</TabsTrigger>
              <TabsTrigger value="hours" className={tabTriggerClass}>Uren</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue">
              <RevenueChart data={chartData} embedded />
            </TabsContent>
            <TabsContent value="hours">
              <WorkedHoursChart data={workedHoursData} embedded />
            </TabsContent>
          </Tabs>
        ) : (
          <RevenueChart data={chartData} embedded />
        )}
      </div>

      {/* Right: Labour / Make Time */}
      <div className={`${panelStyles} p-5`}>
        {hasMakeTime ? (
          <Tabs defaultValue="labour">
            <TabsList className={tabListClass}>
              <TabsTrigger value="labour" className={tabTriggerClass}>Arbeid</TabsTrigger>
              <TabsTrigger value="maketime" className={tabTriggerClass}>Maaktijd</TabsTrigger>
            </TabsList>
            <TabsContent value="labour">
              <LabourChart data={chartData} embedded />
            </TabsContent>
            <TabsContent value="maketime">
              <MakeTimeChart data={makeTimeData} embedded />
            </TabsContent>
          </Tabs>
        ) : (
          <LabourChart data={chartData} embedded />
        )}
      </div>
    </div>
  );
}
