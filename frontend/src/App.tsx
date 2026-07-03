import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { InputPage } from "@/pages/InputPage";
import { NotePage } from "@/pages/NotePage";
import { NotesListPage } from "@/pages/NotesListPage";
import { OutlinePage } from "@/pages/OutlinePage";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { ApiKeyButton } from "@/components/ApiKeyButton";
import { useUiStore } from "@/stores/uiStore";

function App() {
  const location = useLocation();

  // 全局兜底：捕获 fetch 抛出的 MissingApiKeyError（react-query 不一定走 window.onerror）
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      if (event.error?.name === "MissingApiKeyError") {
        event.preventDefault();
        useUiStore.getState().openApiKeyDialog(event.error.message);
      }
    };
    window.addEventListener("error", handler);
    const rejection = (event: PromiseRejectionEvent) => {
      const err = event.reason;
      if (err?.name === "MissingApiKeyError") {
        event.preventDefault();
        useUiStore.getState().openApiKeyDialog(err.message);
      }
    };
    window.addEventListener("unhandledrejection", rejection);
    return () => {
      window.removeEventListener("error", handler);
      window.removeEventListener("unhandledrejection", rejection);
    };
  }, []);

  return (
    <>
      <ApiKeyButton />
      <Routes location={location}>
        <Route path="/" element={<InputPage />} />
        <Route path="/outline" element={<OutlinePage />} />
        <Route path="/note" element={<NotePage />} />
        <Route path="/notes" element={<NotesListPage />} />
      </Routes>
      <ApiKeyDialog />
    </>
  );
}

export default App;
