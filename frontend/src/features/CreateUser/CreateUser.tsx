import React, { useState } from "react";
import GenericPage from "../../app/GenericPage";
import "./CreateUser.css"

interface StatusMessage {
    type: 'success' | 'error' | 'info';
    message: string;
}

const CreateUser: React.FC = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

    const handleSubmit = async () => {
        if (!username) {
            setStatusMessage({
                type: 'error',
                message: 'Please enter a username'
            });
            return;
        }

        setLoading(true);
        setStatusMessage(null); // Clear previous messages

        try {
            const response = await fetch("http://localhost:5000/user/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatusMessage({
                    type: 'success',
                    message: `המשתמש "${username}" נוצר בהצלחה`
                });
                // Reset field on success
                setUsername("");
            } else {
                setStatusMessage({
                    type: 'error',
                    message: data.error || `בקשה נכשלה: ${response.status}`
                });
            }
        } catch (err: any) {
            console.error("Failed to create user:", err);
            
            // Handle different types of errors
            let errorMessage = "Unknown error occurred";
            
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                errorMessage = "לא ניתן לתקשר עם השרת בדוק שהשרת רץ";
            } else if (err.message.includes('NetworkError')) {
                errorMessage = "שגיאת רשת, בדוק את החיבור לרשת";
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setStatusMessage({
                type: 'error',
                message: `לא ניתן היה ליצור את המשתמש: ${errorMessage}`
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <GenericPage containerClassName="create-user-container">
        <h3 className="page-header">יצירת משתמש</h3>

        <div className="config-row">
            <label>הכנס משתמש:</label>
            <input
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            />
        </div>

        <div className="actions-wrapper">
            <div className="send-button-wrapper">
            <button onClick={handleSubmit} disabled={loading || !username}>
                {loading ? "Processing..." : "שלח"}
            </button>
            </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
            <div className={`status-message ${statusMessage.type}`}>
                {statusMessage.message}
            </div>
        )}

        </GenericPage>
    );
};

export default CreateUser;