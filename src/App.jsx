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
  const selectedBoardTitle = useStore((state) => state.selectedBoardTitle);
  

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
      <h1 className="text-2xl font-semibold text-center p-4 bg-gray-800 text-white">Harish's Kanban Board</h1>
      <h2 className="text-xl font-semibold text-center p-4 bg-gray-200">Welcome, {session.user.email}</h2>
      {selectedBoardId ? <div className="text-green-950 font-bold text-center p-4 text-3xl">{selectedBoardTitle}</div> : null}
      <button onClick={() => supabase.auth.signOut()} className="bg-red-500 text-white p-2 rounded-md flex right-2 top-2 absolute">Logout</button>
      <Routes>
        <Route path="/" element={selectedBoardId ? <KanbanBoard /> : <BoardList />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </div>
  );
}

export default App;