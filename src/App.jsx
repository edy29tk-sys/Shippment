
import React, { useState, useEffect } from 'react';
import AuthForm from './components/AuthForm';
import CreateShipment from './components/CreateShipment';
import Tracker from './components/Tracker';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  useEffect(() => {
    if (token) localStorage.setItem('token', token); else localStorage.removeItem('token');
    if (user) localStorage.setItem('user', JSON.stringify(user)); else localStorage.removeItem('user');
  }, [token, user]);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <header>
        <h1>Hands of Hope Shipping — Tracker</h1>
        <p>Simple demo: create shipments and track with a tracking code.</p>
      </header>

      {!token ? (
        <AuthForm setToken={setToken} setUser={setUser} api={API} />
      ) : (
        <div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <strong>{user?.name || user?.email}</strong>
            <button onClick={() => { setToken(null); setUser(null); }}>Log out</button>
          </div>
          <CreateShipment token={token} api={API} />
        </div>
      )}

      <hr style={{ margin: '20px 0' }} />

      <Tracker api={API} />

    </div>
  );
}
