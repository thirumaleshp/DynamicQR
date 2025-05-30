import { useState, useEffect } from "react";
import QRCode from "react-qr-code";

export default function Home() {
  const [redirects, setRedirects] = useState([]);
  const [destinationUrl, setDestinationUrl] = useState("");
  const [selected, setSelected] = useState(null);

  // Fetch all redirects on load
  useEffect(() => {
    fetch("/api/qrcodes")
      .then(res => res.json())
      .then(setRedirects);
  }, []);

  // Create a new QR redirect
  const create = async () => {
    if (!destinationUrl) return alert("Enter a URL");
    const res = await fetch("/api/qrcodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationUrl }),
    });
    const data = await res.json();
    setRedirects([...redirects, data]);
    setDestinationUrl("");
  };

  // Update an existing QR redirect
  const update = async (id) => {
    if (!destinationUrl) return alert("Enter a URL");
    const res = await fetch(`/api/qrcodes?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ destinationUrl }),
    });
    const data = await res.json();
    setRedirects(redirects.map(r => r.id === id ? data : r));
    setDestinationUrl("");
    setSelected(null);
  };

  // The URL encoded in the QR code
  const getUrl = (id) => `${window.location.origin}/r/${id}`;

  return (
    <div style={{ padding: 32, fontFamily: "sans-serif" }}>
      <h1>Dynamic QR Codes</h1>
      <label>
        Destination URL:{" "}
        <input
          value={destinationUrl}
          onChange={e => setDestinationUrl(e.target.value)}
          placeholder="https://example.com"
          style={{ width: 300, marginRight: 8 }}
        />
      </label>
      {selected ? (
        <button onClick={() => update(selected)}>Update</button>
      ) : (
        <button onClick={create}>Create</button>
      )}
      <div style={{ marginTop: 32 }}>
        {redirects.map(r => (
          <div key={r.id} style={{ marginBottom: 24, border: "1px solid #ccc", padding: 16, borderRadius: 8 }}>
            <QRCode value={getUrl(r.id)} />
            <div><b>ID:</b> {r.id}</div>
            <div><b>QR URL:</b> {getUrl(r.id)}</div>
            <div><b>Points to:</b> {r.destinationUrl}</div>
            <button onClick={() => { setSelected(r.id); setDestinationUrl(r.destinationUrl); }}>
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 