import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function Tracker({ api }) {
  const [tracking, setTracking] = useState('');
  const [shipment, setShipment] = useState(null);
  const [err, setErr] = useState('');
  const [notification, setNotification] = useState('');
  const prevStatus = useRef(null);
  const [polling, setPolling] = useState(false);

  async function lookup(e) {
    if (e) e.preventDefault();
    setErr('');
    setShipment(null);
    setNotification('');
    try {
      const res = await axios.get(`${api}/shipments/${tracking}`);
      setShipment(res.data.shipment);
      prevStatus.current = res.data.shipment.status;
      setPolling(true);
    } catch (err) {
      setErr(err.response?.data?.error || 'Not found');
      setPolling(false);
    }
  }

  // Poll for status updates every 10 seconds
  useEffect(() => {
    if (!polling || !shipment) return;
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${api}/shipments/${tracking}`);
        const newStatus = res.data.shipment.status;
        if (prevStatus.current && newStatus !== prevStatus.current) {
          setNotification(`Shipment status updated: ${newStatus}`);
          prevStatus.current = newStatus;
        }
        setShipment(res.data.shipment);
      } catch (err) {
        setErr('Error updating status');
        setPolling(false);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [polling, shipment, api, tracking]);

  return (
    <div style={{ marginTop: 20 }}>
      <h3>Track a package</h3>
      <form onSubmit={lookup}>
        <input
          value={tracking}
          onChange={e => setTracking(e.target.value.toUpperCase())}
          placeholder="Enter tracking code"
        />
        <button type="submit">Track</button>
      </form>

      {err && <p style={{ color: 'red' }}>{err}</p>}
      {notification && <p style={{ color: 'green' }}>{notification}</p>}

      {shipment && (
        <div style={{ border: '1px solid #eee', marginTop: 12, padding: 12 }}>
          <h4>Tracking: {shipment.tracking}</h4>
          <p>Status: {shipment.status}</p>
          <p>Service: {shipment.service} | Weight: {shipment.weight}</p>
          <h5>History</h5>
          <ul>
            {shipment.history.map((h, i) => (
              <li key={i}>
                {h.status} — {new Date(h.at).toLocaleString()}
              </li>
            ))}
          </ul>
          <p>To: {shipment.toName} — {shipment.toAddress}</p>
        </div>
      )}
    </div>
  );
}
