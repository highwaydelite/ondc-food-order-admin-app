import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./config.ts";
import { Toaster } from "react-hot-toast";
import { ConfigProvider } from "antd";
import enGB from "antd/locale/en_GB";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      {/* Ant Design supplies the date range pickers; themed to the app's yellow accent. */}
      <ConfigProvider
        locale={enGB}
        theme={{
          token: {
            colorPrimary: "#facc15",
            colorPrimaryHover: "#eab308",
            borderRadius: 6,
            fontFamily: "inherit",
          },
        }}
      >
        <App />
      </ConfigProvider>
      <Toaster />
    </QueryClientProvider>
  </StrictMode>
);
