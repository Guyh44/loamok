import React, { useState } from "react";
import GenericPage from "../../app/GenericPage";
import "./ManageUser.css";

interface StatusMessage {
  type: 'success' | 'error' | 'info';
  message: string;
}

const UserManager: React.FC = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<StatusMessage | null>(null);

  const handleAction = async (action: string) => {
    if (!username) {
      setStatusMessage({ type: 'error', message: "Please enter a username" });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const response = await fetch("http://localhost:5000/user/manage-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, action }),
      });

      const data = await response.json();

      if (response.ok) {
        let message = "";
        
        // For info action, don't show the success message, only the data
        if (action === "info" && data.info) {
          const { groups, last_logon, password_expires } = data.info;

          message += `Last Logon: ${last_logon || "Unknown"}\n`;
          message += `Password Expires: ${password_expires || "Unknown"}\n`;
          message += `Groups: ${groups && groups.length > 0 ? groups.join(", ") : "None"}`;
        } else {
          // For other actions, show the message
          message = data.message;
          
          // Special message for reset_password
          if (action === "reset_password") {
            message = `הסיסמא של: "${username}" התאפסה בהצלחה.`;
          }
        }

        setStatusMessage({ type: 'success', message });
      } else {
        // Always display error messages for all actions
        setStatusMessage({ type: 'error', message: data.error || `Failed: ${response.status}` });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', message: `Unknown error: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GenericPage containerClassName="create-user-container">
      <h3 className="page-header">Manage Domain User</h3>

      <div className="config-row">
        <label>משתמש:</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter Username"
        />
      </div>

      <div className="actions-wrapper">
        <div className="extra-buttons">
            <button onClick={() => handleAction("unlock")} disabled={loading}>שחרר מנעילה</button>
            <button onClick={() => handleAction("enable")} disabled={loading}>הפוך לפעיל</button>
        </div>
        <div className="extra-buttons">
            <button onClick={() => handleAction("reset_password")} disabled={loading}>איפוס סיסמא</button>
            <button onClick={() => handleAction("info")} disabled={loading}>פרטי משתמש</button>
        </div>

      </div>

      {statusMessage && (
        <div className={`status-message ${statusMessage.type}`}>
          {statusMessage.message}
        </div>
      )}
    </GenericPage>
  );
};

export default UserManager;