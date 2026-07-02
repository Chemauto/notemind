import { Routes, Route } from "react-router-dom";
import { InputPage } from "@/pages/InputPage";
import { NotePage } from "@/pages/NotePage";
import { NotesListPage } from "@/pages/NotesListPage";
import { OutlinePage } from "@/pages/OutlinePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/outline" element={<OutlinePage />} />
      <Route path="/note" element={<NotePage />} />
      <Route path="/notes" element={<NotesListPage />} />
    </Routes>
  );
}

export default App;
