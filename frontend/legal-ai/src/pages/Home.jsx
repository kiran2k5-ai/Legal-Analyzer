import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Stats from "../components/Stats";
import Trusted from "../components/Trusted";
import Features from "../components/Features";
import RagSection from "../components/RagSection";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <Stats />
      <Trusted />
      <Features />
      <RagSection />
      <CTA />
      <Footer />
    </>
  );
}

export default Home;