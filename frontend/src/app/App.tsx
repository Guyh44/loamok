import React from "react";
import "../App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "../features/home/Home";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page1" element={<div>Page 1 (Coming Soon)</div>} />
        <Route path="/page2" element={<div>Page 2 (Coming Soon)</div>} />
        <Route path="/page3" element={<div>Page 3 (Coming Soon)</div>} />
        <Route path="/page4" element={<div>Page 4 (Coming Soon)</div>} />
        <Route path="/page5" element={<div>Page 5 (Coming Soon)</div>} />
        <Route path="/page6" element={<div>Page 6 (Coming Soon)</div>} />
      </Routes>
    </Router>
  );
};

export default App;
