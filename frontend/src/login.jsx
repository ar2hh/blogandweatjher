import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    localStorage.setItem("username", username);
    navigate("/");
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: "400px", margin: "auto" }}>
        <h2 style={{ textAlign: "center" }}>👤 Enter Username</h2>

        <input
          placeholder="Your username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <button style={{ width: "100%", marginTop: "10px" }} onClick={handleSubmit}>
          Continue
        </button>
      </div>
    </div>
  );
}
