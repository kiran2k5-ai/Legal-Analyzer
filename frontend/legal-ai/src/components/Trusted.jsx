function Trusted() {
  const companies = [
    "LEXINGTON & CO",
    "STERLING LEGAL",
    "VANGUARD PARTNERS",
    "JUSTICE GLOBAL",
    "BARRISTER AI",
  ];

  return (
    <section className="border-y border-gray-200 bg-white py-16">
      <div className="mx-auto max-w-7xl px-8">

        <p className="mb-12 text-center text-xs uppercase tracking-[0.4em] text-gray-400">
          Trusted By Global Institutions
        </p>

        <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-5">
          {companies.map((company) => (
            <h3
              key={company}
              className="font-serif text-lg tracking-wide text-gray-500 transition hover:text-black"
            >
              {company}
            </h3>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Trusted;