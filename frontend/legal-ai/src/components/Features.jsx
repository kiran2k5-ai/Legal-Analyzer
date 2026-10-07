import {
  FileText,
  Search,
  Bot,
  PencilLine,
  ClipboardCheck,
  Scale,
} from "lucide-react";

function Features() {
  const features = [
    {
      icon: <FileText size={34} />,
      title: "Secure PDF Intelligence",
      desc: "Upload contracts, agreements, and legal files with secure AI-powered document processing.",
    },
    {
      icon: <Search size={34} />,
      title: "Semantic Search",
      desc: "Retrieve relevant clauses using vector embeddings instead of simple keyword matching.",
    //   active: true,
    },
    {
      icon: <Bot size={34} />,
      title: "Contextual AI Q&A",
      desc: "Ask natural language questions and receive accurate answers grounded in your documents.",
    },
    {
      icon: <PencilLine size={34} />,
      title: "AI Document Summaries",
      desc: "Generate concise summaries of lengthy legal documents in seconds.",
    },
    {
      icon: <ClipboardCheck size={34} />,
      title: "Compliance Review",
      desc: "Quickly identify missing clauses, compliance issues, and legal obligations.",
    },
    {
      icon: <Scale size={34} />,
      title: "Clause Analysis",
      desc: "Understand termination, confidentiality, payment, liability, and other critical clauses.",
    },
  ];

  return (
    <section className="bg-[#F8F8F6] py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mb-16 text-center">
          <p className="mb-3 uppercase tracking-[0.3em] text-sm text-yellow-600 font-semibold">
            AI Capabilities
          </p>

          <h2 className="font-serif text-5xl font-bold text-slate-900">
            Unrivaled Cognitive Capabilities
          </h2>

          <div className="mx-auto mt-5 h-1 w-24 bg-yellow-500 rounded-full"></div>

          <p className="mx-auto mt-8 max-w-3xl text-lg text-gray-600 leading-8">
            Engineered for legal professionals, businesses, researchers,
            and students who demand intelligent document understanding.
          </p>
        </div>

        {/* Cards */}

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {features.map((feature, index) => (

            <div
              key={index}
              className={`group rounded-xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${
                feature.active
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white border-gray-200 hover:bg-slate-900 hover:text-white"
              }`}
            >
              {/* Icon */}

              <div className="mb-6 inline-flex rounded-lg bg-yellow-500/10 p-4 text-yellow-500">
                {feature.icon}
              </div>

              {/* Title */}

              <h3 className="mb-4 text-2xl font-bold">
                {feature.title}
              </h3>

              {/* Description */}

              <p
                className={`leading-7 ${
                  feature.active
                    ? "text-gray-300"
                    : "text-gray-600 group-hover:text-gray-300"
                }`}
              >
                {feature.desc}
              </p>
            </div>

          ))}

        </div>

      </div>
    </section>
  );
}

export default Features;