import React from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";

const App = () => {
  return (
    <div className="bg-white">
      <Header />
      <main>
        <Hero />
      </main>
    </div>
  );
};

export default App;
