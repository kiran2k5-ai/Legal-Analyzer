import {
  MessageSquareText,
  Database,
  Zap,
  BadgeCheck,
  Link2,
} from "lucide-react";

function RagSection() {
  return (
    <section className="bg-[#081827] py-28 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-20 px-8 lg:flex-row">

        {/* Left */}

        <div className="flex-1">

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-yellow-500">
            THE ARCHITECTURE OF TRUTH
          </p>

          <h2 className="font-serif text-5xl font-bold leading-tight">
            Retrieval-Augmented
            <br />
            Generation for Law
          </h2>

          <p className="mt-8 max-w-xl text-lg leading-8 text-gray-300">
            Unlike generic AI models that hallucinate, LegalAI uses a
            proprietary Retrieval-Augmented Generation pipeline. Your
            uploaded legal documents become the trusted source of truth,
            ensuring every response is accurate, explainable, and grounded.
          </p>

          {/* Bullet Points */}

          <div className="mt-12 space-y-8">

            <div className="flex gap-4">

              <div className="mt-1">
                <BadgeCheck className="text-yellow-500" size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Zero-Hallucination Guardrails
                </h3>

                <p className="mt-2 text-gray-400 leading-7">
                  Every response is generated only from your uploaded
                  documents. If the answer doesn't exist in the document,
                  the AI clearly states that.
                </p>
              </div>

            </div>

            <div className="flex gap-4">

              <div className="mt-1">
                <Link2 className="text-yellow-500" size={22} />
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  Interactive Citations
                </h3>

                <p className="mt-2 text-gray-400 leading-7">
                  Every answer includes the exact page number and relevant
                  paragraph so users can verify AI responses instantly.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="flex-1">

          <div className="rounded-2xl border border-slate-700 bg-slate-800 p-10 shadow-2xl">

            <div className="space-y-12">

              {/* Item */}

              <div className="flex items-center gap-6">

                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500">
                  <MessageSquareText
                    size={26}
                    className="text-yellow-500"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-yellow-500">
                    Input
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Complex Legal Query
                  </h3>
                </div>

              </div>

              {/* Item */}

              <div className="flex items-center gap-6">

                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500">
                  <Database
                    size={26}
                    className="text-yellow-500"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-yellow-500">
                    Retrieval
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    Vector Embedding & DB Search
                  </h3>
                </div>

              </div>

              {/* Item */}

              <div className="flex items-center gap-6">

                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-yellow-500">
                  <Zap
                    size={26}
                    className="text-yellow-500"
                  />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-yellow-500">
                    Synthesis
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    AI Response Generation
                  </h3>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

export default RagSection;