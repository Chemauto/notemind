import { Routes, Route } from "react-router-dom";
import { InputPage } from "@/pages/InputPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
    </Routes>
  );
}

export default App;
