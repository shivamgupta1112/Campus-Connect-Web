import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Header from "./components/Header";
import Hero from "./components/Hero";

const App = () => {
  return (
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
          <Hero />
        </main>
      </div>} />

      <Route path="/login" element={<div className="bg-white">
        <main>
          <Hero />
        </main>
      </div>} />

      <Route path="/register" element={<div className="bg-white">
        <main>
          <Hero />
        </main>
      </div>} />

    </Routes>
  );
};

export default App;
