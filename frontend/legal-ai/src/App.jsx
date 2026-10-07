import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Chat from "./pages/Chat"
import Upload from "./pages/Upload";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Home />} />
      <Route path="/chatpage" element={<Chat/>} />
      <Route path="/upload" element={<Upload />} />
    </Routes>
  );
}

export default App;