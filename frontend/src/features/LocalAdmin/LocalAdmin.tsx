import "./LocalAdmin.css";
import GenericPage from "../../app/GenericPage";
import { useState } from "react";
import Spinner from "../../components/Spinner";

interface StatusMessage {
    type: 'success' | 'error' | 'info';
    message: string;
}

const LocalAdmin: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<string>("");
    const [selectedComputer, setSelectedComputer] = useState<string>("");
    const [loadingSendCommand, setLoadingSendCommand] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

    const handleSubmit = async () => {
        if (!selectedUser || !selectedComputer) {
            setStatusMessage({
                type: 'error',
                message: 'Please fill in both username and computer name'
            });
            return;
        }

        setLoadingSendCommand(true);
        setStatusMessage(null); // Clear previous messages
        
        try {
            const payload = {
                computer_name: selectedComputer,
                username: selectedUser,
            };

            console.log("Sending:", payload);

            const res = await fetch("http://localhost:5000/user/add-local-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                // Handle HTTP errors
                setStatusMessage({
                    type: 'error',
                    message: data.error || `Request failed with status ${res.status}`
                });
                return;
            }

            console.log("Add local admin response:", data);

            // Check if the backend returned an error in the result
            if (data.result && data.result.includes('[-]')) {
                setStatusMessage({
                    type: 'error',
                    message: data.result
                });
            } else if (data.result && data.result.includes('[!]')) {
                setStatusMessage({
                    type: 'info',
                    message: data.result
                });
            } else if (data.result && data.result.includes('[+]')) {
                setStatusMessage({
                    type: 'success',
                    message: data.result
                });
                // Reset fields only on success
                setSelectedUser("");
                setSelectedComputer("");
            } else {
                setStatusMessage({
                    type: 'success',
                    message: `Successfully processed request for ${selectedUser} on ${selectedComputer}`
                });
                setSelectedUser("");
                setSelectedComputer("");
            }

        } catch (err: any) {
            console.error("Failed to add admin:", err);
            
            // Handle different types of errors
            let errorMessage = "Unknown error occurred";
            
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                errorMessage = "Cannot connect to server. Please check if the backend is running.";
            } else if (err.message.includes('NetworkError')) {
                errorMessage = "Network error. Please check your connection.";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setStatusMessage({
                type: 'error',
                message: `Failed to send request: ${errorMessage}`
            });
        } finally {
            setLoadingSendCommand(false); 
        }
    };

    return (
        <GenericPage>
            <div id="local-admin-container">
                {/* Username input */}
                <div className="config-row">
                    <label>בחר משתמש:</label>
                    <input 
                        type="text" 
                        placeholder="Enter Username"
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                    />
                </div>

                {/* Computer name input */}
                <div className="config-row">
                    <label>בחר מחשב:</label>
                    <input 
                        type="text" 
                        placeholder="Enter Computer Name"
                        value={selectedComputer}
                        onChange={(e) => setSelectedComputer(e.target.value)}
                    />
                </div>
                
                <div className="actions-wrapper">
                    <div className="send-button-wrapper">
                        <button 
                            onClick={handleSubmit} 
                            disabled={loadingSendCommand || !selectedUser || !selectedComputer}
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

                {/* Status Message */}
                {statusMessage && (
                    <div className={`status-message ${statusMessage.type}`}>
                        {statusMessage.message}
                    </div>
                )}
            </div>
        </GenericPage>
    );
};

export default LocalAdmin;