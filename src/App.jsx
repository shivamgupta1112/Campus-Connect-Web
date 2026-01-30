import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Hero from "./components/Hero";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/auth/Login";
import ForgetPassword from "./pages/auth/ForgetPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Features from "./components/Features";
import Footer from "./components/Footer";
import SignUp from "./pages/auth/SignUp";

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


        <Route path="/about" element={<div className="bg-white">
          <Header />
          <main>
            <Hero />
          </main>
        </div>} />

        <Route path="/contact" element={<div className="bg-white">
          <Header />
          <main>
            <Hero />
          </main>
        </div>} />

        <Route path="/get-started" element={<div className="bg-white">
          <Header />
          <main>
            <GetStarted />
            {/* <Hero /> */}
          </main>
        </div>} />

        <Route path="/login" element={<div className="bg-white">
          <Header />
          <main>
            <Login />
          </main>
        </div>} />

        <Route path="/sign-up" element={<div className="bg-white">
          <Header />
          <main>
            <SignUp />
          </main>
        </div>} />

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

      </Routes>
    </>
  );
};

export default App;
