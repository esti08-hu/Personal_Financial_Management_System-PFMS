import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Services from "./components/Services";
import Testimonial from "./components/Testimonial";
import Footer from "./components/Footer";
import Content from "./components/Content";


export default function Home() {
  return (
    <div>
      <main className="flex flex-col items-center w-full">
        <Navbar />
        <Hero />
        <Content />
        <Services />
        <Testimonial />
        <Footer />
      </main>
    </div>
  );
}