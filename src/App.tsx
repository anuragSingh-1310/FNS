/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SiteStatusWrapper from "./components/SiteStatusWrapper";
import Recommendation from "./components/Recommendation";
import FloatingWhatsApp from "./components/FloatingWhatsApp";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Analytics } from "@vercel/analytics/react";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <SiteStatusWrapper>
            <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-emerald-200 selection:text-emerald-900 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Recommendation />
              <FloatingWhatsApp />
              <Footer />
            </div>
          </SiteStatusWrapper>
        </BrowserRouter>
        <Analytics />
      </AuthProvider>
    </ErrorBoundary>
  );
}
