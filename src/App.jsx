// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import BoardList from './components/BoardList';
import KanbanBoard from './components/KanbanBoard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useStore from './store';

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const selectedBoardId = useStore((state) => state.selectedBoardId);

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
      <button onClick={() => supabase.auth.signOut()} className="bg-red-500 text-white p-2 rounded-md">Logout</button>
      <Routes>
        <Route path="/" element={selectedBoardId ? <KanbanBoard /> : <BoardList />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
}

export default App;