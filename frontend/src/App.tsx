import { Routes, Route } from "react-router-dom";
import { InputPage } from "@/pages/InputPage";
import { OutlinePage } from "@/pages/OutlinePage";
import { NotePage } from "@/pages/NotePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/outline" element={<OutlinePage />} />
      <Route path="/note" element={<NotePage />} />
    </Routes>
  );
}

export default App;
