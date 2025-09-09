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
        // Special message for reset_password
        let message = data.message;
        if (action === "reset_password") {
          message = `הסיסמא של: "${username}" התאפסה בהצלחה.`;
        }

        // If action is info, append the info output
      if (action === "info" && data.info) {
        const { groups, last_logon, password_expires } = data.info;

        message += "\n\n";
        message += `Last Logon: ${last_logon || "Unknown"}\n`;
        message += `Password Expires: ${password_expires || "Unknown"}\n`;
        message += `Groups: ${groups && groups.length > 0 ? groups.join(", ") : "None"}`;
      }

        setStatusMessage({ type: 'success', message });
      } else {
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
            <button onClick={() => handleAction("disable")} disabled={loading}>Disable</button>
            <button onClick={() => handleAction("enable")} disabled={loading}>Enable</button>
        </div>
        <div className="extra-buttons">
            <button onClick={() => handleAction("reset_password")} disabled={loading}>Reset Password</button>
            <button onClick={() => handleAction("info")} disabled={loading}>User Info</button>
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
