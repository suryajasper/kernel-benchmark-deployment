import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import AddKernels from "./pages/AddKernels";
import Tuning from "./pages/Tuning";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/kernel-benchmark-deployment/dashboard" element={<Dashboard />} />
        <Route path="/kernel-benchmark-deployment/history" element={<History />} />
        <Route path="/kernel-benchmark-deployment/new" element={<AddKernels />} />
        <Route path="/kernel-benchmark-deployment/tune" element={<Tuning />} />
        <Route path="*" element={<Navigate to="/kernel-benchmark-deployment/dashboard" replace />} />
      </Routes>
    </Router>
  </StrictMode>
);
