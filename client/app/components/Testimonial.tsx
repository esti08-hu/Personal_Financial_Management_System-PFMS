"use client";
import React from "react";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css/skyblue";
import "@splidejs/react-splide/css/sea-green";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Sarah, Retail Manager",
    image: "/images/testimonial1.png",
    text: "Using this personal financial system has been a game-changer for me...",
  },
  {
    id: 2,
    name: "Michael, Small Business Owner",
    image: "/images/testimonial2.png",
    text: "As a small business owner, I was struggling to keep track...",
  },
  {
    id: 3,
    name: "Jenna, Marketing Coordinator",
    image: "/images/testimonial3.png",
    text: "This personal financial system has been a game-changer for my family's financial well-being...",
  },
];

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
            type: "loop",
            perPage: 1,
            autoplay: true,
            interval: 3000,
            pauseOnHover: true,
          }}
        >
          {testimonials.map((testimonial) => (
            <SplideSlide
              key={testimonial.id}
              className="flex justify-center items-center w-full"
            >
              <div className="w-full bg-white rounded-lg flex flex-col p-4 md:p-8">
                <div className="flex sm:flex-col justify-between gap-4 md:gap-4 items-center w-full">
                  <div className="h-32 w-32 md:h-44 md:w-44 bg-[#00ABCD] rounded-r-full sm:rounded-full sm:!w-32 sm:!h-32 flex justify-center items-center">
                    <Image
                      src={testimonial.image}
                      alt={`Testimonial from ${testimonial.name}`}
                      className="p-3 md:p-5"
                      width={200}
                      height={200}
                    />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-lg md:text-2xl font-bold font-mono text-[#22577A]">
                      {testimonial.name}
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
                    {[...Array(5)].map((_, index) => (
                      <li key={index}>
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
                    {testimonial.text}
                  </p>
                </div>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </div>
  );
};

export default Testimonial;
