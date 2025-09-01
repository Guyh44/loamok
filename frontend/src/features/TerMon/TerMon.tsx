import "./TerMon.css";
import GenericPage from "../../app/GenericPage";
import { useState, useRef } from "react";
import Spinner from "../../components/Spinner";
import { switchOptions } from "../../data/switchs";

const TerMon: React.FC = () => {
    const [selectedSwitch, setSelectedSwitch] = useState<string>("");
    const [loadingSendCommand, setLoadingSendCommand] = useState<boolean>(false);
    const [logs, setLogs] = useState<string[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const formatLogLine = (line: string) => {
        // Check if line contains our formatted output with arrow and state
        if (line.includes('|')) {
            const [content, state] = line.split('|');
            const isUp = state?.trim() === 'up';
            
            return (
                <div className={`log-line ${isUp ? 'interface-up' : 'interface-down'}`}>
                    {content}
                </div>
            );
        }
        
        // Regular log line
        return <div className="log-line">{line}</div>;
    };

    const handleSubmit = async () => {
        setLoadingSendCommand(true);
        setLogs([]);
        abortControllerRef.current = new AbortController();

        try {
            const payload = { ip: selectedSwitch };
            const res = await fetch("http://localhost:5000/switch/termon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: abortControllerRef.current.signal,
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder("utf-8");

            if (!reader) throw new Error("ReadableStream not supported");

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n").filter(line => line.trim());
                setLogs(prev => [...prev, ...lines]);
            }
        } catch (err: any) {
            if (err.name === "AbortError") {
                setLogs(prev => [...prev, "Stream stopped by user."]);
            } else {
                console.error("Failed to start ter mon:", err);
                setLogs(prev => [...prev, `Error: ${err.message}`]);
            }
        } finally {
            setLoadingSendCommand(false);
        }
    };

    const handleStop = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    return (
        <GenericPage>
            <h3 className="page-header">
                הקפצת נקודות
            </h3>
            {/* Switch selection */}
            <div className="config-row">
                <label>בחר SWITCH:</label>
                <select
                    value={selectedSwitch}
                    onChange={(e) => setSelectedSwitch(e.target.value)}
                >
                    <option value="">-- בחר SWITCH --</option>
                    {switchOptions.map(option => (
                        <option key={option.ip} value={option.ip}>
                            {option.ricuz} : {option.ip}
                        </option>
                    ))}
                </select>
            </div>

            {/* Buttons */}
            <div className="actions-wrapper">
                <div className="send-button-wrapper">
                    <button 
                        onClick={handleSubmit} 
                        disabled={loadingSendCommand || !selectedSwitch}
                    >
                        התחל
                    </button>
                    <button
                        onClick={handleStop}
                        disabled={!loadingSendCommand}
                        style={{ marginLeft: "10px" }}
                    >
                        עצור
                    </button>
                    {loadingSendCommand && (
                        <div className="spinner-netx-to-start">
                            <Spinner isLoading={true} size={25} />
                        </div>
                    )}
                </div>
            </div>

            {/* Logs display */}
            { selectedSwitch &&
                <div className="terminal-output">
                {logs.map((line, i) => (
                    <div key={i}>
                        {formatLogLine(line)}
                    </div>
                ))}
            </div>
            }
            
        </GenericPage>
    );
};

export default TerMon;