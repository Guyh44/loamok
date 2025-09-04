import React, { useState } from "react";
import GenericPage from "../../app/GenericPage";
import "../AdGroup/AdGroup.css";

const AddToADGroup: React.FC = () => {
  const [username, setUsername] = useState("");
  const [groupname, setGroupname] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("http://localhost:5000/user/add-to-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, groupname }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: "success", message: result.message || "User added to group successfully!" });
        setUsername("");
        setGroupname("");
      } else {
        setStatus({ type: "error", message: result.message || "Failed to add user to group." });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: err.message || "Unexpected error occurred." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GenericPage containerClassName="add-to-group-container">
      <h3 className="page-header">הוספת משתמש לקבוצה ב-AD</h3>

      <div className="config-row">
        <label>בחר משתמש:</label>
        <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="config-row">
        <label>בחר קבוצה:</label>
        <input
          type="text"
          placeholder="Enter AD Group"
          value={groupname}
          onChange={(e) => setGroupname(e.target.value)}
        />
      </div>

      <div className="actions-wrapper">
        <div className="send-button-wrapper">
          <button onClick={handleSubmit} disabled={loading || !username || !groupname}>
            {loading ? "Processing..." : "שלח"}
          </button>
        </div>
      </div>

      {status && (
        <div className={`status-message ${status.type}`}>
          {status.message}
        </div>
      )}
    </GenericPage>
  );
};

export default AddToADGroup;
