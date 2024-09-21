import Image from "next/image";
import React from "react";

const Hero = () => {
  return (
    <div
      id="hero"
      style={{ backgroundColor: "rgba(0, 172, 205, 0.25)" }}
      className="hero-container flex items-center mt-20 w-full justify-center relative"
    >
      <div className="hero flex flex-col md:flex-row h-full w-2/3 justify-around items-center p-10">
        <div className="flex flex-col items-start justify-center max-w-fit h-96 gap-5 text-center md:text-left md:w-2/3">
          <h1 className="!text-4xl md:text-2xl font-black text-[#22577A] mb-6 w-full md:w-96">
            Plan your future with confidence.
          </h1>
          <p className="text-xl md:text-xl font-bold text-[#00ABCD] w-full md:w-72">
            Create and manage budgets effortlessly.
          </p>
          <a href="/pages/signup">
            <button
              type="button"
              className="text-white border-2 bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 rounded-lg text-lg md:text-xl px-4 md:px-5 py-2 text-center me-2 mb-2"
            >
              Create account now
            </button>
          </a>
        </div>
        <div className="mt-6 md:mt-0">
          <Image
            src="/images/hero-img.png"
            alt="Hero img"
            width={400}
            height={300}
            className="w-full md:w-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
