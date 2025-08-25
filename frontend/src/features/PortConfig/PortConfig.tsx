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
      const payload = { ip: selectedSwitch, port: selectedPort };

      const res = await fetch(`http://localhost:5000/switch/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }

      await res.json();
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
      await fetch("http://localhost:5000/switch/change-vlan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ switch: selectedSwitch, port: selectedPort, vlan: selectedVlan }),
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
  }, [selectedSwitch, showInterfaceStatus]);

  return (
    <GenericPage title="Port Configuration">
      <div className="port-config-wrapper">
        {/* Interface Status Container */}
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
            <pre>{interfaceStatus}</pre>
          </div>
        </div>

        {/* Main Config */}
        <div id="port-config-container" className={showInterfaceStatus ? "slide-right" : ""}>
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
              label="בחר פורט:"
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
            {selectedPort && (
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
            )}

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
        </div>
      </div>
    </GenericPage>
  );
};

export default PortConfig;
