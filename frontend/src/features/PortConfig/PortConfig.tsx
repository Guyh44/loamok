import "./PortConfig.css";
import GenericPage from "../../app/GenericPage";
import { useState } from "react";
import { vlanOptions } from "../../data/vlanOptions";
import type { vlanDropDownOptions } from "../../data/vlanOptions";
import { switchOptions } from "../../data/switchs";
import type { IPDropdownOption } from "../../data/switchs";

const PortConfig: React.FC = () => {
  const [selectedVlan, setSelectedVlan] = useState<string>("");
  const [selectedSwitch, setSelectedSwitch] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<string>("");

  const ports = ["1", "2", "3", "4", "5", "6", "7", "8"]; // available ports

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
            {ports.map((port) => (
              <option key={port} value={port}>
                {port}
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
            {vlanOptions.map((option: vlanDropDownOptions) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </GenericPage>
  );
};

export default PortConfig;
