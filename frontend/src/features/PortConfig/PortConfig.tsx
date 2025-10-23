import "./PortConfig.css";
import GenericPage from "../../app/GenericPage";
import { useState, useEffect, useRef } from "react";
import { switchOptions } from "../../data/switchs";
import type { IPDropdownOption } from "../../data/switchs";
import { getPorts } from "./getPorts";
import { getVlans } from "./getVlan";
import type { VlanDropdownOption } from "./getVlan";
import Spinner from "../../components/Spinner";
import SelectBox from "../../components/SelectBox";
import axios from "axios";
import type React from "react";

const API_BASE = "http://localhost:5000/";

// Helper function to format interface status with color coding
const formatInterfaceStatus = (rawStatus: string, selectedPort: string): React.JSX.Element => {
  const lines = rawStatus.split('\n');
  
  return (
    <>
      {lines.map((line, index) => {
        const trimmed = line.trim();
        
        // Skip empty lines completely (don't render them)
        if (!trimmed) {
          return null;
        }
        
        // Detect header line - works for both "show int status" and "show interfaces description"
        const isHeader = (trimmed.includes('Port') || trimmed.includes('Interface')) && 
                        (trimmed.includes('Status') || trimmed.includes('Protocol'));
        
        if (isHeader) {
          return (
            <div key={index} className="interface-line header">
              {line}
            </div>
          );
        }
        
        // Parse port name (first word) - handles both Gi1/0/1 and Gi0/0/0 formats
        const parts = trimmed.split(/\s+/);
        const portName = parts[0];
        
        // Normalize both selected port and current port for comparison
        const normalizePort = (port: string) => {
          if (!port) return '';
          // Remove spaces, slashes, commas, and any other non-alphanumeric characters except the port separator
          return port.toLowerCase().replace(/[^a-z0-9]/g, '');
        };
        
        const normalizedPort = normalizePort(portName);
        const normalizedSelected = normalizePort(selectedPort);
        const isSelected = selectedPort && normalizedPort === normalizedSelected;
        
        // Determine status class - check the second column (Status/Protocol column)
        let statusClass = '';
        
        // For "show int status" format: status is in parts[1]
        // For "show interfaces description" format: status is also in parts[1]
        if (parts.length >= 2) {
          const statusWord = parts[1].toLowerCase();
          
          if (statusWord === 'connected' || statusWord === 'up') {
            statusClass = 'connected';
          } else if (statusWord === 'notconnect' || statusWord === 'down') {
            statusClass = 'notconnect';
          } else if (statusWord === 'err-disabled') {
            statusClass = 'err-disabled';
          }
        }
        
        // Combine classes
        const className = `interface-line ${statusClass} ${isSelected ? 'selected' : ''}`.trim();
        
        return (
          <div 
            key={index} 
            className={className}
            id={isSelected ? 'selected-port-line' : undefined}
          >
            {line}
          </div>
        );
      })}
    </>
  );
};

const PortConfig: React.FC = () => {
  const [selectedSwitch, setSelectedSwitch] = useState<string>("");
  const [selectedPort, setSelectedPort] = useState<string>("");
  const [selectedVlan, setSelectedVlan] = useState<string>("");

  const [ports, setPorts] = useState<{ value: string; label: string }[]>([]);
  const [vlanOptions, setVlanOptions] = useState<VlanDropdownOption[]>([]);

  const [interfaceStatus, setInterfaceStatus] = useState<string>("");
  const [showInterfaceStatus, setShowInterfaceStatus] = useState<boolean>(false);

  // Loading states
  const [loadingPorts, setLoadingPorts] = useState<boolean>(false);
  const [loadingVlans, setLoadingVlans] = useState<boolean>(false);
  const [loadingShutCommand, setLoadingShutCommand] = useState<boolean>(false);
  const [loadingSendCommand, setLoadingSendCommand] = useState<boolean>(false);
  const [loadingInterfaceStatus, setLoadingInterfaceStatus] = useState<boolean>(false);

  const interfaceStatusRef = useRef<HTMLDivElement>(null);
  const animationInProgressRef = useRef<boolean>(false);

  const fetchInterfaceStatus = async (switchIp: string) => {
    setLoadingInterfaceStatus(true);
    try {
      const response = await axios.post(`${API_BASE}switch/int-status`, { ip: switchIp });
      setInterfaceStatus(response.data.interfaces || "No interface status available");
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
      const payload = { ip: selectedSwitch, port: selectedPort };
      await axios.post(`${API_BASE}switch/${action}`, payload);
      alert(`Success: ${action} on ${selectedPort}`);

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
      await axios.post(`${API_BASE}switch/change-vlan`, {
        switch: selectedSwitch,
        port: selectedPort,
        vlan: selectedVlan
      });

      if (showInterfaceStatus && selectedSwitch) {
        await fetchInterfaceStatus(selectedSwitch);
      }

      setSelectedPort("");
      setSelectedVlan("");
    } catch (err: any) {
      console.error("VLAN change failed:", err);
      alert(`Failed to send configuration: ${err.message}`);
    } finally {
      setLoadingSendCommand(false);
    }
  };

  // Auto-scroll to selected port
  useEffect(() => {
    if (selectedPort && interfaceStatusRef.current) {
      setTimeout(() => {
        const selectedElement = document.getElementById('selected-port-line');
        if (selectedElement && interfaceStatusRef.current) {
          selectedElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }, 100);
    }
  }, [selectedPort, interfaceStatus]);

  useEffect(() => {
    const header = document.querySelector('header');
      if (header) {
        if (showInterfaceStatus) {
          header.classList.add('expand-header');
        } else {
          header.classList.remove('expand-header');
        }
      }
      
      // Cleanup on unmount
      return () => {
        const header = document.querySelector('header');
        if (header) {
          header.classList.remove('expand-header');
        }
      };
    }, [showInterfaceStatus]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedSwitch) {
        setPorts([]);
        setVlanOptions([]);
        setLoadingInterfaceStatus(false);

        if (showInterfaceStatus) {
          setShowInterfaceStatus(false);
          animationInProgressRef.current = true;

          setTimeout(() => {
            setInterfaceStatus("");
            animationInProgressRef.current = false;
          }, 600);
        }
        return;
      }

      if (animationInProgressRef.current) return;

      animationInProgressRef.current = true;
      setLoadingPorts(true);
      setLoadingVlans(true);
      setLoadingInterfaceStatus(true);

      try {
        setShowInterfaceStatus(true);

        requestAnimationFrame(async () => {
          try {
            const [portsList, vlanList] = await Promise.all([
              getPorts(selectedSwitch),
              getVlans(selectedSwitch),
            ]);

            setPorts(portsList.map((p) => ({ value: p, label: p })));
            setVlanOptions(vlanList.map((v) => ({ value: v, label: `VLAN ${v}` })));
            setLoadingPorts(false);
            setLoadingVlans(false);

            setTimeout(async () => {
              await fetchInterfaceStatus(selectedSwitch);
              animationInProgressRef.current = false;
            }, 650);
          } catch (err) {
            console.error("Failed to fetch ports or VLANs:", err);
            setPorts([]);
            setVlanOptions([]);
            setLoadingPorts(false);
            setLoadingVlans(false);
            setLoadingInterfaceStatus(false);
            animationInProgressRef.current = false;
          }
        });
      } catch (err) {
        console.error("Failed to initialize data fetch:", err);
        setLoadingInterfaceStatus(false);
        animationInProgressRef.current = false;
      }
    };

    fetchData();
  }, [selectedSwitch]);

  return (
    <>
      {/* Status panel is now a sibling, so it can sit behind GenericPage */}
      <div className="port-config-wrapper">
        <div className={`interface-status-container ${showInterfaceStatus ? "show" : ""}`}>
          <div className="interface-status-header">
            <h3>Interface Status - {selectedSwitch}</h3>
            {loadingInterfaceStatus && (
              <div className="header-spinner">
                <Spinner isLoading={true} size={20} />
              </div>
            )}
          </div>
          <div className="interface-status-content" ref={interfaceStatusRef}>
            <pre>
              {formatInterfaceStatus(interfaceStatus, selectedPort)}
            </pre>
          </div>
        </div>
      </div>

      {/* GenericPage stays above it */}
      <GenericPage
        title="Port Configuration"
        containerClassName={showInterfaceStatus ? "slide-right-container" : ""}
      >
        <h3 className="page-header">
            קנפוג פורטים במתג
        </h3>
        <SelectBox
          id="switch"
          label="בחר SWITCH:"
          value={selectedSwitch}
          onChange={setSelectedSwitch}
          options={switchOptions.map((option: IPDropdownOption) => ({
            value: option.ip,
            label: `${option.ricuz} : ${option.ip}`,
          }))}
        />

        <div className="config-row-with-spinner">
          <SelectBox
            id="port"
            label="בחר PORT:"
            value={selectedPort}
            onChange={setSelectedPort}
            options={ports}
          />
          {loadingPorts && (
            <div className="spinner-inline">
              <Spinner isLoading={true} size={25} />
            </div>
          )}
        </div>

        <div className="config-row-with-spinner">
          <SelectBox
            id="vlan"
            label="בחר VLAN:"
            value={selectedVlan}
            onChange={setSelectedVlan}
            options={vlanOptions}
          />
          {loadingVlans && (
            <div className="spinner-inline">
              <Spinner isLoading={true} size={25} />
            </div>
          )}
        </div>

        <div className="actions-wrapper">
          <div className="extra-buttons">
            <button onClick={() => sendCommand("shut")} disabled={!selectedSwitch || !selectedPort || loadingShutCommand}>
              shut
            </button>
            <button onClick={() => sendCommand("no-shut")} disabled={!selectedSwitch || !selectedPort || loadingShutCommand}>
              no shut
            </button>
            {loadingShutCommand && (
              <div className="spinner-button-left">
                <Spinner isLoading={true} size={25} />
              </div>
            )}
          </div>

          <div className="send-button-wrapper">
            <button
              onClick={handleSubmit}
              disabled={loadingSendCommand || !selectedSwitch || !selectedPort || !selectedVlan}
            >
              שלח
            </button>
            {loadingSendCommand && (
              <div className="spinner-button-left">
                <Spinner isLoading={true} size={25} />
              </div>
            )}
          </div>
        </div>
      </GenericPage>
    </>
  );
};

export default PortConfig;