import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-[#081827] text-gray-300">

      <div className="mx-auto grid max-w-7xl gap-12 px-8 py-20 md:grid-cols-4">

        {/* Logo */}

        <div>

          <h2 className="font-serif text-3xl font-bold text-white">
            LegalAI
          </h2>

          <p className="mt-6 leading-8 text-gray-400">
            AI-powered legal document intelligence built
            using Retrieval-Augmented Generation.
          </p>

        <div className="mt-8 flex gap-4 text-2xl">
        <FaGithub className="cursor-pointer hover:text-yellow-500 transition" />
        <FaLinkedin className="cursor-pointer hover:text-yellow-500 transition" />
        <FaEnvelope className="cursor-pointer hover:text-yellow-500 transition" />
        </div>

        </div>

        {/* Product */}

        <div>

          <h3 className="mb-5 text-lg font-semibold text-white">
            Product
          </h3>

          <ul className="space-y-3">

            <li className="hover:text-yellow-500 cursor-pointer">
              Features
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              AI Search
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              Upload
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              Chat
            </li>

          </ul>

        </div>

        {/* Resources */}

        <div>

          <h3 className="mb-5 text-lg font-semibold text-white">
            Resources
          </h3>

          <ul className="space-y-3">

            <li className="hover:text-yellow-500 cursor-pointer">
              Documentation
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              API
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              Blog
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              Contact
            </li>

          </ul>

        </div>

        {/* Legal */}

        <div>

          <h3 className="mb-5 text-lg font-semibold text-white">
            Legal
          </h3>

          <ul className="space-y-3">

            <li className="hover:text-yellow-500 cursor-pointer">
              Privacy Policy
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              Terms of Service
            </li>

            <li className="hover:text-yellow-500 cursor-pointer">
              Cookies
            </li>

          </ul>

        </div>

      </div>

      <div className="border-t border-slate-700 py-6 text-center text-gray-500">

        © 2026 LegalAI. All Rights Reserved.

      </div>

    </footer>
  );
}

export default Footer;