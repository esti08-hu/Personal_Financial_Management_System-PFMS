import Image from "next/image";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer
      style={{ backgroundColor: "rgba(0, 172, 205, 0.25)" }}
      className="footer-container bg-[#00ABCD] w-full mt-20 flex flex-col items-center"
    >
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 py-10">
          <div className="footer-logo flex flex-col items-center md:items-start">
            <Image
              src="/moneymaster.png"
              width={120}
              height={80}
              alt="Money Master Logo"
            />
            <p className="text-sm text-[#857E7E] mt-4 text-center md:text-left">
              Physiological respiration ensures that the functional composition
              is maintained.
            </p>
          </div>

          <div className="footer-navigation">
            <h3 className="text-lg font-bold text-[#857E7E] mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/services">Services</Link>
              </li>
              <li>
                <Link href="/about">About</Link>
              </li>
              <li>
                <Link href="/faqs">FAQs</Link>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3 className="text-lg font-bold text-[#857E7E] mb-4">Contact</h3>
            <ul className="space-y-2">
              <li>+(406) 555-0120</li>
              <li>+(480) 555-0103</li>
              <li>
                <a href="mailto:thuhang.nute@gmail.com">
                  thuhang.nute@gmail.com
                </a>
              </li>
              <li>Abstergo Ltd.</li>
            </ul>
          </div>

          <div className="footer-subscribe">
            <h3 className="text-lg font-bold text-[#857E7E] mb-4">
              Get the Latest Information
            </h3>
            <div className="flex items-center border-none bg-white rounded-full pl-4">
                  <input
                    type="text"
                    placeholder="Email Address"
                    className="w-full focus:ring-blue-500 appearance-none focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="ml-2 text-gray-500 p-4 bg-[#22577A] hover:text-gray-700 rounded-tr-3xl rounded-br-3xl rounded-bl-3xl"
                  >
                    <Image
                      src="/images/send.png"
                      width={40}
                      height={40}
                      alt="send imag"
                    />
                  </button>
                </div>
          </div>
        </div>

        <div className="social-icons flex justify-center space-x-6 mt-8">
          <a href="#">
            <Image
              src="/images/facebook.png"
              width={40}
              height={40}
              alt="Facebook"
            />
          </a>
          <a href="#">
            <Image
              src="/images/github.png"
              width={40}
              height={40}
              alt="GitHub"
            />
          </a>
          <a href="#">
            <Image
              src="/images/twitter.png"
              width={40}
              height={40}
              alt="Twitter"
            />
          </a>
          <a href="#">
            <Image
              src="/images/linkedin.png"
              width={40}
              height={40}
              alt="LinkedIn"
            />
          </a>
        </div>
      </div>

      <div className="w-full bg-gray-800 text-[#857E7E] py-4">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between">
          <span>
            © 2024{" "}
            <Link href="/" className="hover:underline">
              Estio
            </Link>
            . All Rights Reserved.
          </span>
          <ul className="flex space-x-4">
            <li>
              <Link href="#">User Terms & Conditions</Link>
            </li>
            <li>
              <span>|</span>
            </li>
            <li>
              <Link href="#">Privacy & Policy</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
