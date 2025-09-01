import { Routes, Route } from "react-router-dom";
import Header from "../components/Header";
import Home from "../features/home/Home";
import GenericPage from "./GenericPage.tsx";
import PortConfig from "../features/PortConfig/PortConfig.tsx";
import LocalAdmin from "../features/LocalAdmin/LocalAdmin.tsx";
import TerMon from "../features/TerMon/TerMon.tsx";
import AdGroup from "../features/AdGroup/AdGroup.tsx"
import "../App.css";

const App: React.FC = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-admin" element={<LocalAdmin/>} />
        <Route path="/manage-users" element={<GenericPage/>} />
        <Route path="/change-vlan" element={<PortConfig/>} />
        <Route path="/manage-vms" element={<GenericPage/>} />
        <Route path="/groups" element={<AdGroup/>} />
        <Route path="/create-user" element={<GenericPage/>} />
        <Route path="/ter-mon" element={<TerMon/>} />
      </Routes>
    </>
  );
};

export default App;
