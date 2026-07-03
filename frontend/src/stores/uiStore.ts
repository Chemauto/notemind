import { create } from "zustand";

interface UiState {
  apiKeyDialogOpen: boolean;
  apiKeyDialogReason: string | null;
  openApiKeyDialog: (reason?: string | null) => void;
  closeApiKeyDialog: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  apiKeyDialogOpen: false,
  apiKeyDialogReason: null,
  openApiKeyDialog: (reason = null) => set({ apiKeyDialogOpen: true, apiKeyDialogReason: reason }),
  closeApiKeyDialog: () => set({ apiKeyDialogOpen: false, apiKeyDialogReason: null }),
}));
