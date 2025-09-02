import React, { useState } from "react";
import GenericPage from "../../app/GenericPage";
import "./CreateUser.css"

const CreateUser: React.FC = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/user/create-user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });
            if(response.ok)
            {
                alert("user created")
            }
        }catch{
            alert("error creating user")
        }
        finally{
            setLoading(false)
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

        </GenericPage>
    );
};

export default CreateUser;
