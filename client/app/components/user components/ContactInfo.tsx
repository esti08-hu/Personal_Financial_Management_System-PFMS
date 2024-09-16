import React from "react";

const ContactInfo = () => {
  return (
    <div
      style={{ backgroundColor: "rgba(0, 172, 205, 0.25)" }}
      className="w-1/3 rounded-3xl h-5/6 pb-3 flex flex-col items-center justify-center"
    >
      <div className=" max-w-sm p-6 rounded-lg  dark:border-gray-700 flex flex-col gap-4 justify-center">
        <h5 className="mb-2 text-xl text-center font-bold tracking-tight text-[#22577A]">
          About Us
        </h5>

        <p className="font-normal text-[#857E7E] dark:text-gray-400">
          A project by Estifanos, Tofiq, Flimon & Belay
        </p>
        <p className="font-normal text-[#857E7E] dark:text-gray-400">
          Department of SE
        </p>
        <p className="font-normal text-[#857E7E] dark:text-gray-400">
          Adama Science and Technology University
        </p>
      </div>

      <div className="block max-w-sm p-6 rounded-lg  dark:border-gray-700 text-center">
        <h5 className=" text-xl font-bold tracking-tight text-[#00ABCD]  mb-5">
          Stay Connected On
        </h5>
        <div className="font-normal text-[#857E7E] dark:text-gray-400">
          <ul className="flex justify-between gap-6">
            <li>
              <a href="#" className="">
                <img src="/images/facebook.png" alt="facebook-icon"/>
              </a>
            </li>
            <li>
              <a href="/https://github.com/esti08-hu" className="">
                <img src="/images/github.png" alt="github-icon"/>
              </a>
            </li>
            <li>
              <a href="#" className="">
                <img src="/images/twitter.png" alt="twitter-icon" />
              </a>
            </li>
            <li>
              <a href="#" className="">
                <img src="/images/linkedin.png" alt="linkedin-icon" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
