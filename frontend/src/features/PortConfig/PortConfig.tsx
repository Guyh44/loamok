import "./PortConfig.css";
import GenericPage from "../../app/GenericPage";
import { useState, useEffect, useRef } from "react";
import { switchOptions } from "../../data/switchs";
import type { IPDropdownOption } from "../../data/switchs";
import { getPorts } from "./getPorts";
import { getVlans } from "./getVlan";
import type { VlanDropdownOption } from "./getVlan"; 
import Spinner from "../../components/Spinner";

const PortConfig: React.FC = () => {
  const [selectedSwitch, setSelectedSwitch] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [selectedVlan, setSelectedVlan] = useState<string>("");
  const [ports, setPorts] = useState<{ value: string; label: string }[]>([]);
  const [vlanOptions, setVlanOptions] = useState<VlanDropdownOption[]>([]);
  const [interfaceStatus, setInterfaceStatus] = useState<string>("");
  const [showInterfaceStatus, setShowInterfaceStatus] = useState<boolean>(false);
  
  // Separate loading states for different operations
  const [loadingPorts, setLoadingPorts] = useState<boolean>(false);
  const [loadingVlans, setLoadingVlans] = useState<boolean>(false);
  const [loadingShutCommand, setLoadingShutCommand] = useState<boolean>(false);
  const [loadingSendCommand, setLoadingSendCommand] = useState<boolean>(false);
  const [loadingInterfaceStatus, setLoadingInterfaceStatus] = useState<boolean>(false);

  const interfaceStatusRef = useRef<HTMLDivElement>(null);

  const fetchInterfaceStatus = async (switchIp: string) => {
    setLoadingInterfaceStatus(true);
    try {
      const response = await fetch(`http://localhost:5000/switch/int-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: switchIp }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setInterfaceStatus(data.interfaces || "No interface status available");
    } catch (error: any) {
      console.error("Failed to fetch interface status:", error);
      setInterfaceStatus(`Error: ${error.message}`);
    } finally {
      setLoadingInterfaceStatus(false);
    }
  };

  const sendCommand = async (action: "shut" | "no-shut") => {
    setLoadingShutCommand(true);
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

      // Refresh interface status if it's being displayed
      if (showInterfaceStatus && selectedSwitch) {
        await fetchInterfaceStatus(selectedSwitch);
      }

    } catch (err: any) {
      console.error(`${action} failed:`, err);
      alert(`Failed to ${action} port: ${err.message}`);
    } finally {
      setLoadingShutCommand(false); 
    }
  };

  const handleSubmit = async () => {
    setLoadingSendCommand(true);
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

      // Refresh interface status after VLAN change
      if (showInterfaceStatus && selectedSwitch) {
        await fetchInterfaceStatus(selectedSwitch);
      }

      //Reset port and vlan after submit
      setSelectedPort("");
      setSelectedVlan("");
    } catch (err: any) {
      console.error("VLAN change failed:", err);
      alert(`Failed to send configuration: ${err.message}`);
    } finally {
      setLoadingSendCommand(false); 
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSwitch) {
        setPorts([]);
        setVlanOptions([]);
        setShowInterfaceStatus(false);
        setInterfaceStatus("");
        return;
      }
      
      setLoadingPorts(true);
      setLoadingVlans(true);
      
      try {
        // Fetch ports and map to { value, label } objects
        const portsList = await getPorts(selectedSwitch);
        setPorts(portsList.map((p) => ({ value: p, label: p })));
        setLoadingPorts(false);

        // Fetch VLANs and map to { value, label } objects for the select box
        const vlanList = await getVlans(selectedSwitch);
        setVlanOptions(vlanList.map((v) => ({ value: v, label: `VLAN ${v}` })));
        setLoadingVlans(false);

        // Show interface status container and fetch initial status
        setShowInterfaceStatus(true);
        // Small delay to allow the slide animation to start
        setTimeout(async () => {
          await fetchInterfaceStatus(selectedSwitch);
        }, 200);

      } catch (err) {
        console.error("Failed to fetch ports or VLANs:", err);
        setPorts([]);
        setVlanOptions([]);
        setLoadingPorts(false);
        setLoadingVlans(false);
      }
    };

    fetchData();
  }, [selectedSwitch]);

  return (
    <GenericPage>
      <div className="port-config-wrapper">
        {/* Interface Status Container */}
        <div className={`interface-status-container ${showInterfaceStatus ? 'show' : ''}`}>
          <div className="interface-status-header">
            <h3>Interface Status - {selectedSwitch}</h3>
            {loadingInterfaceStatus && (
              <div className="header-spinner">
                <Spinner isLoading={true} size={20} />
              </div>
            )}
          </div>
          <div className="interface-status-content" ref={interfaceStatusRef}>
            <pre>{interfaceStatus}</pre>
          </div>
        </div>

        {/* Main Port Config Container */}
        <div id="port-config-container" className={showInterfaceStatus ? 'slide-right' : ''}>
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
            {loadingPorts && (
              <div className="spinner-inline">
                <Spinner isLoading={true} size={25} />
              </div>
            )}
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
            {loadingVlans && (
              <div className="spinner-inline">
                <Spinner isLoading={true} size={25} />
              </div>
            )}
          </div>
          
          <div className="actions-wrapper">
            {selectedPort && (
              <div className="extra-buttons">
                <button onClick={() => sendCommand("shut")} disabled={!selectedSwitch || !selectedPort || loadingShutCommand}>shut</button>
                <button onClick={() => sendCommand("no-shut")} disabled={!selectedSwitch || !selectedPort || loadingShutCommand}>no shut</button>
                {loadingShutCommand && (
                  <div className="spinner-button-left">
                    <Spinner isLoading={true} size={25} />
                  </div>
                )}
              </div>
            )}
            
            <div className="send-button-wrapper">
              <button onClick={handleSubmit} disabled={loadingSendCommand}> שלח </button>
              {loadingSendCommand && (
                <div className="spinner-button-left">
                  <Spinner isLoading={true} size={25} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GenericPage>
  );
};

export default PortConfig;