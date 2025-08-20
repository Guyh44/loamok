import "./PortConfig.css";
import GenericPage from "../../app/GenericPage";
import { useState, useEffect } from "react";
import { switchOptions } from "../../data/switchs";
import type { IPDropdownOption } from "../../data/switchs";
import { getPorts } from "./getPorts";
import { getVlans } from "./getVlan";
import type { VlanDropdownOption } from "./getVlan"; 

const PortConfig: React.FC = () => {
  const [selectedSwitch, setSelectedSwitch] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [selectedVlan, setSelectedVlan] = useState<string>("");
  const [ports, setPorts] = useState<{ value: string; label: string }[]>([]);
  const [vlanOptions, setVlanOptions] = useState<VlanDropdownOption[]>([]);

  const sendCommand = async (action: "shut" | "no-shut") => {
    try {
      const payload = {
        ip: selectedSwitch,   
        port: selectedPort,
      };

      console.log(`Sending ${action}:`, payload);

      const res = await fetch(`http://localhost:5000/switch/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const data = await res.json();
      console.log(`${action} response:`, data);

      alert(`Success: ${action} on ${selectedPort}`);

    } catch (err: any) {
      console.error(`${action} failed:`, err);
      alert(`Failed to ${action} port: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        switch: selectedSwitch,
        port: selectedPort,
        vlan: selectedVlan,
      };

      console.log("Sending:", payload);

     await fetch("http://localhost:5000/switch/change-vlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          switch: selectedSwitch,
          port: selectedPort,
          vlan: selectedVlan,
        }),
      });



      //Reset port and vlan after submit
      setSelectedPort("");
      setSelectedVlan("");
    } catch (err: any) {
      console.error("VLAN change failed:", err);
      alert(`Failed to send configuration: ${err.message}`);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSwitch) {
        setPorts([]);
        setVlanOptions([]);
        return;
      }

      try {
        // Fetch ports and map to { value, label } objects
        const portsList = await getPorts(selectedSwitch);
        setPorts(portsList.map((p) => ({ value: p, label: p })));

        // Fetch VLANs and map to { value, label } objects for the select box
        const vlanList = await getVlans(selectedSwitch);
        setVlanOptions(vlanList.map((v) => ({ value: v, label: `VLAN ${v}` })));

      } catch (err) {
        console.error("Failed to fetch ports or VLANs:", err);
        setPorts([]);
        setVlanOptions([]);
      }
    };

    fetchData();
  }, [selectedSwitch]);


  return (
    <GenericPage title="Change VLAN">
      <div id="port-config-container">
        {/* Switch selection */}
        <div className="config-row">
          <label>בחר SWITCH:</label>
          <select
            value={selectedSwitch}
            onChange={(e) => setSelectedSwitch(e.target.value)}
          >
            <option value="">-- בחר SWITCH --</option>
            {switchOptions.map((option: IPDropdownOption) => (
              <option key={option.ip} value={option.ip}>
                {option.ricuz} : {option.ip}
              </option>
            ))}
          </select>
        </div>

        {/* Port selection */}
        <div className="config-row">
          <label>בחר פורט:</label>
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
          >
            <option value="">-- בחר פורט --</option>
            {ports.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* VLAN selection */}
        <div className="config-row">
          <label>בחר VLAN:</label>
          <select
            value={selectedVlan}
            onChange={(e) => setSelectedVlan(e.target.value)}
          >
            <option value="">-- בחר VLAN --</option>
            {vlanOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {selectedPort && (
          <div className="extra-buttons">
            <button onClick={() => sendCommand("shut")} disabled={!selectedSwitch || !selectedPort}>shut</button>
            <button onClick={() => sendCommand("no-shut")} disabled={!selectedSwitch || !selectedPort}>no shut</button>
          </div>
        )}
        <button onClick={handleSubmit}> שלח </button>
      </div>
    </GenericPage>
  );
};

export default PortConfig;
