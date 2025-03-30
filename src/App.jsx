// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import KanbanBoard from './components/KanbanBoard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useStore from './store';

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  if (!session) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="h-screen">
      <div className="bg-green-800 text-white p-4 flow-root">
      <h3 className="text-2xl font-semibold text-left float-left">Harish's Kanban Board</h3>
      <h2 className="text-xl font-semibold float-right"> &nbsp;{session.user.email}</h2>
      <input type="text" placeholder='Search' className="border p-2 bg-white text-black rounded-md float-right" />
      </div>
      <Routes>
        <Route path="/" element={<KanbanBoard />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
}

export default App;