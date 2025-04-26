import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RechargeCheck from "./pages/RechargeCheck";
import ResultsPage from "./pages/ResultsPage";
import "antd/dist/reset.css";
import "./index.css";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RechargeCheck />} />
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </Router>
  );
}
