import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "../features/home/Home";
import GenericPage from "./GenericPage.tsx";
import "../App.css";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page1" element={<GenericPage/>} />
        <Route path="/page2" element={<GenericPage/>} />
        <Route path="/page3" element={<GenericPage/>} />
        <Route path="/page4" element={<GenericPage/>} />
        <Route path="/page5" element={<GenericPage/>} />
        <Route path="/page6" element={<GenericPage/>} />
      </Routes>
    </>
  );
};

export default App;
