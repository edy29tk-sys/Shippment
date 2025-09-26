import React, { useState } from 'react';
import axios from 'axios';

export default function AuthForm({ setToken, setUser, api }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault(); setErr('');
    try {
      const url = `${api}/${mode === 'login' ? 'login' : 'register'}`;
      const res = await axios.post(url, mode === 'login' ? { email, password } : { name, email, password });
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setErr(err.response?.data?.error || 'Something went wrong');
    }
  }

  return (
    <div style={{ border: '1px solid #ddd', padding: 16, borderRadius: 8 }}>
      <h3>{mode === 'login' ? 'Log in' : 'Register'}</h3>
      <form onSubmit={submit}>
        {mode === 'register' && (
          <div><label>Name</label><br /><input value={name} onChange={e => setName(e.target.value)} /></div>
        )}
        <div><label>Email</label><br /><input value={email} onChange={e => setEmail(e.target.value)} type="email" /></div>
        <div><label>Password</label><br /><input value={password} onChange={e => setPassword(e.target.value)} type="password" /></div>
        <div style={{ marginTop: 8 }}>
          <button type="submit">{mode === 'login' ? 'Log in' : 'Register'}</button>
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ marginLeft: 8 }}>
            {mode === 'login' ? 'Create account' : 'Have an account? Log in'}
          </button>
        </div>
        {err && <p style={{ color: 'red' }}>{err}</p>}
      </form>
    </div>
  );
}
