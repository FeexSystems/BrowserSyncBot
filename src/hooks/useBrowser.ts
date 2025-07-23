import { useContext } from "react";
import {
  BrowserContext,
  BrowserContextType,
} from "../contexts/BrowserContext";

export const useBrowser = (): BrowserContextType => {
  const context = useContext(BrowserContext);
  if (context === undefined) {
    throw new Error("useBrowser must be used within a BrowserProvider");
  }
  return context;
};
