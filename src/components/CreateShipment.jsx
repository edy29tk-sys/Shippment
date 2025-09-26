import React, { useState } from 'react';
import axios from 'axios';

export default function CreateShipment({ token, api }) {
  const [toName, setToName] = useState('');
  const [toAddress, setToAddress] = useState('');
  const [weight, setWeight] = useState('');
  const [service, setService] = useState('Ground');
  const [created, setCreated] = useState(null);

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await axios.post(`${api}/shipments`, { toName, toAddress, weight, service }, { headers: { Authorization: `Bearer ${token}` } });
      setCreated(res.data.shipment);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  }

  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, marginTop: 12 }}>
      <h4>Create shipment</h4>
      <form onSubmit={submit}>
        <div><label>Recipient name</label><br /><input value={toName} onChange={e => setToName(e.target.value)} /></div>
        <div><label>Address</label><br /><input value={toAddress} onChange={e => setToAddress(e.target.value)} /></div>
        <div><label>Weight</label><br /><input value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label>Service</label><br /><select value={service} onChange={e => setService(e.target.value)}><option>Ground</option><option>Express</option></select></div>
        <div style={{ marginTop: 8 }}><button type="submit">Create</button></div>
      </form>

      {created && (
        <div style={{ marginTop: 12, padding: 8, background: '#f9f9f9' }}>
          <strong>Created!</strong>
          <div>Tracking: <code>{created.tracking}</code></div>
          <div>Status: {created.status}</div>
        </div>
      )}
    </div>
  );
}
