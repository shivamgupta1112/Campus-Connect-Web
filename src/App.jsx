import React from "react";
import { Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Hero from "./components/Hero";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/auth/Login";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import PdfViewer from "./pages/PdfViewer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Features from "./components/Features";
import Footer from "./components/Footer";

const App = () => {
  return (
    <>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      <Routes>
        <Route path="/" element={<div className="bg-white">
          <Header />
          <main>
            <Hero />
            <Features />
          </main>
          <Footer />
        </div>} />


        <Route path="/about" element={<><Header /><About /></>} />
        <Route path="/contact" element={<><Header /><Contact /></>} />
        <Route path="/get-started/dashboard" element={<GetStarted />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<div className="bg-white">
          <Header />
          <main>
            <ForgetPassword />
          </main>
        </div>} />

        <Route path="/reset-password" element={<div className="bg-white">
          <Header />
          <main>
            <ResetPassword />
          </main>
        </div>} />

        <Route path="/pdf-viewer/:noteId" element={<PdfViewer />} />

      </Routes>
    </>
  );
};

export default App;
