"use client";
import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/skyblue";
import "@splidejs/react-splide/css/sea-green";
import Image from "next/image";

const Testimonial = () => {
  return (
    <div id="testimonials" className="testimonial-container px-4 md:px-0">
      <div className="text-section mb-10 flex flex-col justify-center items-center w-full">
        <h5 className="text-gray-500 text-sm md:text-base">-- TESTIMONIALS</h5>
      </div>
      <div className="testimonial container flex justify-center items-center pt-4 pb-4 bg-[#E3F0F3] rounded-lg">
        <Splide
          aria-label="Testimonials"
          className="rounded-sm w-full md:w-3/5"
          options={{
            perPage: 1,
            rewind: true,
            gap: "1rem",
            padding: "1rem",
          }}
        >
          {/* Testimonial Slide 1 */}
          <SplideSlide className={"flex justify-center items-center w-full"}>
            <div className="w-full bg-white rounded-lg flex flex-col p-4 md:p-8">
              <div className="flex sm:flex-col justify-between gap-4 md:gap-4 items-center w-full">
                <div className="h-32 w-32 md:h-44 md:w-44 bg-[#00ABCD] rounded-r-full sm:rounded-full sm:!w-32 sm:!h-32 flex justify-center items-center">
                  <Image
                    src="/images/testimonial1.png"
                    alt="img 1"
                    className="p-3 md:p-5"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="text-center md:text-left">
                  <h3 className="text-lg md:text-2xl font-bold font-mono text-[#22577A]">
                    Sarah, Retail Manager
                  </h3>
                </div>
                <div className="bg-[#00A9CB] p-4 rounded-full h-fit">
                  <Image
                    src="/images/quote.png"
                    alt="Quote img"
                    width={20}
                    height={20}
                    className="md:w-6 md:h-6"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <ul className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <li key={i}>
                      <Image
                        src="/images/full-star.png"
                        width={30}
                        height={30}
                        alt="Star"
                      />
                    </li>
                  ))}
                </ul>
                <div className="text-gray-500">5.0</div>
              </div>
              <div className="p-4 md:p-5 text-[#807E7E] flex justify-center items-center">
                <p className="w-full md:w-5/6 text-sm md:text-base text-center">
                  Using this personal financial system has been a game-changer
                  for me. Before, my finances were a mess, with bills piling up
                  and no clear idea of where my money was going.
                </p>
              </div>
            </div>
          </SplideSlide>

          {/* Testimonial Slide 2 */}
          <SplideSlide className={"flex justify-center items-center w-full"}>
            <div className="w-full bg-white rounded-lg flex flex-col p-4 md:p-8">
              <div className="flex sm:flex-col justify-between gap-4 md:gap-4 items-center w-full">
                <div className="h-32 w-32 md:h-44 md:w-44 bg-[#00ABCD] rounded-r-full sm:rounded-full sm:!w-32 sm:!h-32 flex justify-center items-center">
                  <Image
                    src="/images/testimonial2.png"
                    alt="img 2"
                    className="p-3 md:p-5"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg md:text-2xl font-bold font-mono text-[#22577A]">
                   Michael, Small Business Owner
                  </h3>
                </div>
                <div className="bg-[#00A9CB] p-4 rounded-full h-fit">
                  <Image
                    src="/images/quote.png"
                    alt="Quote img"
                    width={30}
                    height={30}
                    className="md:w-10 md:h-10"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <ul className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <li key={i}>
                      <Image
                        src="/images/full-star.png"
                        width={30}
                        height={30}
                        alt="Star"
                      />
                    </li>
                  ))}
                </ul>
                <div className="text-gray-500">5.0</div>
              </div>
              <div className="p-4 md:p-5 text-[#807E7E] flex justify-center items-center">
                <p className="w-full md:w-5/6 text-sm md:text-base text-center">
                  As a small business owner, I was struggling to keep track of
                  all my business and personal finances. This personal financial
                  system has been a lifesaver.
                </p>
              </div>
            </div>
          </SplideSlide>

          {/* Testimonial Slide 3 */}
          <SplideSlide className={"flex justify-center items-center w-full"}>
            <div className="w-full bg-white rounded-lg flex flex-col p-4 md:p-8">
              <div className="flex sm:flex-col justify-between gap-4 md:gap-4 items-center w-full">
                <div className="h-32 w-32 md:h-44 md:w-44 bg-[#00ABCD] rounded-r-full sm:rounded-full sm:!w-32 sm:!h-32 flex justify-center items-center">
                  <Image
                    src="/images/testimonial3.png"
                    alt="img 3"
                    className="p-3 md:p-5"
                    width={200}
                    height={200}
                  />
                </div>
                <div className="text-center">
                  <h3 className="text-lg md:text-2xl font-bold font-mono text-[#22577A]">
                    Jenna, Marketing Coordinator
                  </h3>
                </div>
                <div className="bg-[#00A9CB] p-4 rounded-full h-fit">
                  <Image
                    src="/images/quote.png"
                    alt="Quote img"
                    width={30}
                    height={30}
                    className="md:w-10 md:h-10"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-2 mt-4">
                <ul className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <li key={i}>
                      <Image
                        src="/images/full-star.png"
                        width={30}
                        height={30}
                        alt="Star"
                      />
                    </li>
                  ))}
                </ul>
                <div className="text-gray-500">5.0</div>
              </div>
              <div className="p-4 md:p-5 text-[#807E7E] flex justify-center items-center">
                <p className="w-full md:w-5/6 text-sm md:text-base text-center">
                  This personal financial system has been a game-changer for my
                  family's financial well-being. The intuitive interface and
                  user-friendly features make it easy for both my spouse and I
                  to stay on top of our household finances.
                </p>
              </div>
            </div>
          </SplideSlide>
        </Splide>
      </div>
    </div>
  );
};

export default Testimonial;
