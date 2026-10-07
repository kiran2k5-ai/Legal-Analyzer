import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

function Navbar() {
  const { user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-8">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <span className="text-2xl">⚖</span>
          <h1 className="text-3xl font-serif font-bold text-gray-900 hover:text-blue-900 transition">
            LegalAI
          </h1>
        </Link>

        {/* Menu */}
        <ul className="hidden gap-10 text-sm font-medium text-gray-600 md:flex">
          <li>
            <Link to="/chatpage" className="hover:text-blue-600 transition cursor-pointer">
              Dashboard
            </Link>
          </li>

          <li>
            <Link to="/upload" className="hover:text-blue-600 transition cursor-pointer">
              Library
            </Link>
          </li>
        </ul>

        {/* Button */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Welcome, <span className="font-semibold text-slate-900">{user.full_name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded border border-[#081827] px-5 py-2.5 text-sm font-semibold text-[#081827] transition hover:bg-[#081827] hover:text-white cursor-pointer"
              >
                Log Out
              </button>
            </div>
          ) : (
            <Link
              to="/register"
              className="rounded bg-[#081827] px-6 py-3 text-sm font-semibold text-white transition hover:bg-black cursor-pointer"
            >
              Access Portal
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;