import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Shield, User, Mail, Lock } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      toast.success('Account created! Welcome to Sentinel.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand"><Shield size={28} color="#00f5ff" /><span>SENTINEL</span></div>
        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Start auditing your code for free</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <User size={16} className="input-icon" />
            <input type="text" placeholder="Username" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required minLength={3} />
          </div>
          <div className="input-group">
            <Mail size={16} className="input-icon" />
            <input type="email" placeholder="Email address" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="input-group">
            <Lock size={16} className="input-icon" />
            <input type="password" placeholder="Password (min 6 chars)" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
