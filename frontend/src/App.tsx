import { Routes, Route } from "react-router-dom";
import { InputPage } from "@/pages/InputPage";
import { OutlinePage } from "@/pages/OutlinePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/outline" element={<OutlinePage />} />
    </Routes>
  );
}

export default App;
