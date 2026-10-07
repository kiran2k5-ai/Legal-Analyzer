import { FaBullseye, FaBolt, FaDatabase, FaBalanceScale } from "react-icons/fa";

function Stats() {
  const stats = [
    {
      icon: <FaBullseye className="text-yellow-400 text-xl" />,
      value: "99.8%",
      label: "Accuracy Rate",
    },
    {
      icon: <FaBolt className="text-yellow-400 text-xl" />,
      value: "< 2s",
      label: "Retrieval Speed",
    },
    {
      icon: <FaDatabase className="text-yellow-400 text-xl" />,
      value: "50M+",
      label: "Documents Analyzed",
    },
    {
      icon: <FaBalanceScale className="text-yellow-400 text-xl" />,
      value: "500+",
      label: "Partner Law Firms",
    },
  ];

  return (
    <section className="bg-[#0F172A] text-white">
      <div className="mx-auto max-w-7xl px-8 py-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-4 border-l border-gray-700 pl-4"
            >
              {item.icon}

              <div>
                <h2 className="text-xl font-bold">{item.value}</h2>
                <p className="text-sm text-gray-400">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Stats;