import { Link } from "react-router-dom";

function CTA() {
  return (
    <section className="bg-[#F8F8F6] py-28">
      <div className="mx-auto max-w-5xl px-8 text-center">

        <p className="mb-3 uppercase tracking-[0.35em] text-yellow-600 text-sm font-semibold">
          Get Started Today
        </p>

        <h2 className="font-serif text-5xl font-bold text-slate-900">
          Secure Your Digital Legacy
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-600">
          Transform the way you analyze legal documents with
          AI-powered semantic search, intelligent summaries,
          and contextual question answering.
        </p>

        <div className="mt-14 flex flex-col justify-center gap-5 sm:flex-row">

          <Link
            to="/register"
            className="rounded-md bg-slate-900 px-8 py-4 font-semibold text-white transition hover:bg-black inline-block cursor-pointer"
          >
            Start Free Analysis
          </Link>

          <Link
            to="/register"
            className="rounded-md border border-slate-300 px-8 py-4 font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white inline-block cursor-pointer"
          >
            Learn More
          </Link>

        </div>

        <p className="mt-8 text-sm italic text-gray-400">
          Your documents remain private and encrypted.
        </p>

      </div>
    </section>
  );
}

export default CTA;