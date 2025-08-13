import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "../features/home/Home";
import Page from "./Page.tsx";
import "../App.css";

const App: React.FC = () => {
  return (
    <>
      <Header /> {/* Show header on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/page1" element={<Page title="Page 1" />} />
        <Route path="/page2" element={<Page title="Page 2" />} />
        <Route path="/page3" element={<Page title="Page 3" />} />
        <Route path="/page4" element={<Page title="Page 4" />} />
        <Route path="/page5" element={<Page title="Page 5" />} />
        <Route path="/page6" element={<Page title="Page 6" />} />
      </Routes>
    </>
  );
};

export default App;
