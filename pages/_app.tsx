import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { BrowserProvider } from "../src/contexts/BrowserContext";
import { ThemeProvider } from "../src/contexts/ThemeContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <BrowserProvider>
        <Component {...pageProps} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            className: "glass-card text-white",
            style: {
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            },
          }}
        />
      </BrowserProvider>
    </ThemeProvider>
  );
}

export default MyApp;
