import React from "react";
import { ConfigProvider } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RechargeCheck from "./pages/RechargeCheck";
import ResultsPage from "./pages/ResultsPage";
import { I18nProvider } from "./i18n/I18nContext";
import "antd/dist/reset.css";

function App() {
  return (
    <I18nProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "#ff3366",
            colorInfo: "#ff3366",
            colorSuccess: "#0ea46f",
            colorTextBase: "#1f2937",
            colorBorder: "#e5e7eb",
            borderRadius: 12,
            fontFamily: "Sora, Manrope, Segoe UI, sans-serif",
          },
          components: {
            Card: {
              boxShadowTertiary: "0 18px 34px rgba(15, 23, 42, 0.08)",
            },
            Button: {
              controlHeight: 42,
              fontWeight: 600,
            },
            Tag: {
              fontWeight: 600,
            },
          },
        }}
      >
        <Router>
          <Routes>
            <Route path="/" element={<RechargeCheck />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </Router>
      </ConfigProvider>
    </I18nProvider>
  );
}

export default App;
