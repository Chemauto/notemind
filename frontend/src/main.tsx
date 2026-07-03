import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { MissingApiKeyError } from "@/lib/api";
import { useUiStore } from "@/stores/uiStore";

const should_open_api_key_dialog = (error: unknown) => {
  if (error instanceof MissingApiKeyError) {
    useUiStore.getState().openApiKeyDialog(error.message);
    return true;
  }
  return false;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // MissingApiKeyError 不重试，直接弹窗
        if (error instanceof MissingApiKeyError) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
      onError: (error) => should_open_api_key_dialog(error),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
