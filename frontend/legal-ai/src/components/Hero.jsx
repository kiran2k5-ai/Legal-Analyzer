import heroImage from "../assets/images/hero.jpg";
import { Parallax } from "react-scroll-parallax";

function Hero() {
  return (
    <section
      className="relative h-screen bg-fixed bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-8">
        <div className="max-w-2xl text-white">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-yellow-400">
            Professional Grade Artificial Intelligence
          </p>

          <h1 className="mb-6 font-serif text-5xl font-bold leading-tight md:text-6xl">
            Analyze Legal Documents with
            <br />
            Absolute Authority
          </h1>

          <p className="mb-8 max-w-xl text-lg text-gray-200">
            The precision of Retrieval-Augmented Generation meets the
            legacy of legal excellence. Upload contracts, agreements,
            and legal files to receive intelligent summaries and
            instant answers.
          </p>

          <div className="flex gap-4">
            <button className="rounded bg-yellow-500 px-6 py-3 font-semibold text-black transition hover:bg-yellow-400">
              Start New Analysis
            </button>

            <button className="rounded border border-white px-6 py-3 font-semibold text-white transition hover:bg-white hover:text-black">
              View Case Studies
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;