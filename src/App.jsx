import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Hero from "./components/Hero";
import GetStarted from "./pages/GetStarted";
import Login from "./pages/auth/Login";

const App = () => {
  return (
    <>
      <Toaster position="top-center" containerStyle={{ zIndex: 99999 }} />
      <Routes>
        <Route path="/" element={<div className="bg-white">
          <Header />
          <main>
            <Hero />
          </main>
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
          <main>
            <Hero />
          </main>
        </div>} />

      </Routes>
    </>
  );
};

export default App;
