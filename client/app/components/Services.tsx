import React from "react";
import Image from "next/image";

const Services = () => {
  return (
    <div
      id="services"
      className="services-container w-full mb-16 flex flex-col justify-center items-center"
    >
      <div className="text-section mt-10 mb-10 flex flex-col justify-center items-center w-full">
        <h5 className="text-gray-500">-- OUR SERVICES</h5>
      </div>
      <div className="services container flex flex-col gap-16 justify-center items-center pt-10 pb-10 rounded-lg ">
        <div className="flex flex-col items-center gap-6 w-3/4">
          <div className="flex items-center justify-around gap-20 w-full">
            <div className="flex flex-col gap-4 w-1/2">
              <h2 className="text-2xl font-bold text-[#22577A] ">
                Budgeting and Expense Tracking
              </h2>
              <p className="w-3/4">
                The ability to create and manage a household budget, categorize
                expenses, and track spending patterns over time.
              </p>
              {/* <button className="bg-[#00ABCD] text-white p-2 rounded-lg w-1/3">
                Read More
              </button> */}
            </div>
            {/* Services Image */}
            <div>
              <Image
                src="/images/services1.png"
                width={250}
                height={60}
                alt="Retirement"
              />
            </div>
          </div>
          <hr className=" rounded bg-gray-600 w-1/3" />
        </div>

        <div className="flex flex-col items-center gap-6 w-3/4">
          <div className="flex items-center justify-around gap-20 w-full">
            <div>
              <Image
                src="/images/services2.png"
                width={250}
                height={60}
                alt="Retirement"
              />
            </div>

            <div className="flex flex-col items-end gap-4 w-1/2">
              <h2 className="text-2xl font-bold text-[#22577A] ">
                Income and Savings Management
              </h2>
              <div className="">
                <p className="">
                  Tracking and recording all sources of income, such as
                  salaries,
                </p>
                <p className="">investments, and other revenue streams.</p>
              </div>
              {/* <button className="bg-[#00ABCD] text-white p-2 rounded-lg w-1/3">
                Read More
              </button> */}
            </div>
            {/* Services Image */}
          </div>
          <hr className="rounded bg-gray-600 w-1/3" />
        </div>

        <div className="flex flex-col items-center gap-6 w-3/4">
          <div className="flex items-center justify-around gap-20 w-full">
            <div className="flex flex-col gap-4 w-1/2">
              <h2 className="text-2xl font-bold text-[#22577A] ">
                Financial Goal Setting{" "}
              </h2>
              <p className="w-3/4">
                Monitoring progress towards these goals and adjusting plans as
                needed to stay on track.
              </p>
              {/* <button className="bg-[#00ABCD] text-white p-2 rounded-lg w-1/3">
                Read More
              </button> */}
            </div>
            {/* Services Image */}
            <div>
              <Image
                src="/images/services3.png"
                width={250}
                height={60}
                alt="Retirement"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-52 h-0 border-b border-dashed border-2 border-gray-500 mt-16"></div>
    </div>
  );
};

export default Services;
