import React from "react";
import Image from "next/image";

const Content = () => {
  return (
    <div
      id="working-process"
      className="container h-full flex flex-col items-center justify-center mt-10 gap-4 w-full"
    >
      <div className="text-section mt-10 flex flex-col justify-center items-center w-full gap-10">
        <h5 className="text-gray-500">-- OUR WORKING PROCESS</h5>
        <h1 className="text-3xl md:text-4xl font-black text-[#22577A] mb-6 text-center w-full md:w-96">
          How to get started
        </h1>
      </div>

      {/* Steps Section */}
      <div className="flex flex-col md:flex-row w-full md:w-2/3 justify-around items-center gap-2 sm:gap-10 text-center">
        {/* Step 1 */}
        <div className="flex flex-col !w-115 md:w-1/4 !h-100 gap-6 items-center sm:h-1/2">
          <img src="/step1.png" alt="Step 1" className="w-28 md:w-36" />
          <h2 className="text-[#22577A] text-lg md:text-xl font-black">
            Create an account
          </h2>
          <p className="text-gray-500 text-sm md:text-lg">
            Enter your basic information and set up your profile.
          </p>
        </div>

        {/* Connector */}
        <div className="hidden md:block w-1/4 h-0.5 bg-gray"></div>

        {/* Step 2 */}
        <div className="flex flex-col !w-115 md:w-1/4 min-h-100 gap-6 items-center sm:h-1/2">
          <img src="/step2.png" alt="Step 2" className="w-28 md:w-36" />
          <h2 className="text-[#22577A] text-lg md:text-xl font-black">
            Create your budget
          </h2>
          <p className="text-gray-500 text-sm md:text-lg">
            Utilize our budgeting tools to create a realistic budget.
          </p>
        </div>

        {/* Connector */}
        <div className="hidden md:block w-1/4 h-0.5 bg-gray"></div>

        {/* Step 3 */}
        <div className="flex flex-col !w-115 md:w-1/4 min-h-100 gap-6 items-center sm:h-1/2">
          <img src="/step3.png" alt="Step 3" className="w-28 md:w-36" />
          <h2 className="text-[#22577A] text-lg md:text-xl font-black">
            Set financial goals
          </h2>
          <p className="text-gray-500 text-sm md:text-lg">
            Define your short- and long-term financial goals.
          </p>
        </div>

        {/* Connector */}
        <div className="hidden md:block w-1/4 h-0.5 bg-gray"></div>

        {/* Step 4 */}
        <div className="flex flex-col !w-115 md:w-1/4 min-h-100 gap-6 items-center sm:h-1/2">
          <img src="/step4.png" alt="Step 4" className="w-28 md:w-36" />
          <h2 className="text-[#22577A] text-lg md:text-xl font-black">
            Explore our features
          </h2>
          <p className="text-gray-500 text-sm md:text-lg">
            Leverage our tools for budgeting, investments, and debt.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="w-32 md:w-52 h-0 border-b border-dashed border-2 border-gray-500 mb-20 mt-10"></div>
    </div>
  );
};

export default Content;
