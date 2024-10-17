import apiClient from "@/app/lib/axiosConfig";
import type { ApexOptions } from "apexcharts";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";

interface ChartThreeState {
  series: number[];
}

const options: ApexOptions = {
  chart: {
    fontFamily: "Satoshi, sans-serif",
    type: "donut",
  },
  colors: ["#3C50E0", "#6577F3", "#8FD0EF", "#0FADCF"],
  labels: ["Active", "Unverified", "Locked", "Inactive"],
  legend: {
    show: false,
    position: "bottom",
  },

  plotOptions: {
    pie: {
      donut: {
        size: "65%",
        background: "transparent",
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 380,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

const ChartThree: React.FC = () => {
  const [series, setSeries] = useState<number[]>([0, 0, 0, 0]);
  const [percentages, setPercentages] = useState<number[]>([0, 0, 0, 0]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeResponse = await apiClient.get("/user/count/active-accounts");
        const inactiveResponse = await apiClient.get(
          "/user/count/inactive-accounts"
        );
        const unverifiedResponse = await apiClient.get(
          "/user/count/unverified-accounts"
        );
        const lockedResponse = await apiClient.get("/user/count/locked-accounts");
        const totalResponse = await apiClient.get("/user/count/total-accounts");

        // Calculate the number of users for each status
        const activeCount = activeResponse.data;
        const inactiveCount = inactiveResponse.data;
        const unverifiedCount = unverifiedResponse.data;
        const lockedCount = lockedResponse.data;
        const totalCount = totalResponse.data;

        if (totalCount > 0) {
          const activePercentage = (activeCount / totalCount) * 100;
          const inactivePercentage = (inactiveCount / totalCount) * 100;
          const unverifiedPercentage = (unverifiedCount / totalCount) * 100;
          const lockedPercentage = (lockedCount / totalCount) * 100;

          setSeries([
            activePercentage,
            unverifiedPercentage,
            lockedPercentage,
            inactivePercentage,
          ]);
          setPercentages([
            activePercentage,
            unverifiedPercentage,
            lockedPercentage,
            inactivePercentage,
          ]);
        }
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Accounts Analytics
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-primary"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
              <span> Active </span>
              <span> {percentages[0].toFixed(1)}% </span>
            </p>
          </div>
        </div>
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#6577F3]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
              <span> Unverified </span>
              <span>{percentages[1].toFixed(1)}% </span>
            </p>
          </div>
        </div>
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#0FADCF]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
              <span> Inactive </span>
              <span> {percentages[3].toFixed(1)}% </span>
            </p>
          </div>
        </div>
        <div className="w-full px-8 sm:w-1/2">
          <div className="flex w-full items-center">
            <span className="mr-2 block h-3 w-full max-w-3 rounded-full bg-[#8FD0EF]"></span>
            <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
              <span> Locked </span>
              <span> {percentages[2].toFixed(1)}% </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartThree;
