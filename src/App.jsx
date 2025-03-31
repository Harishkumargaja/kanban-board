// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import KanbanBoard from './components/KanbanBoard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import useStore from './store';
import { FaUser } from 'react-icons/fa6';

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const divRef = useRef(null);

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
      <div className="bg-green-800 text-white p-2 flex flex-row">
      <h3 className="text-2xl font-semibold text-left flex-none">Harish's Kanban Board</h3>
      <div className='flex-grow'></div>
      <input type="text" placeholder='Search' className="border bg-white text-black rounded-md flex-end" />
      &nbsp;
      <div onClick={() => handleToggle()} className="items-center flex-end text-2xl cursor-pointer">&nbsp; <FaUser /></div>
      {isOpen && (
        <div ref={divRef} className='bg-gray-500 absolute text-2xl text-gray-800 right-2 top-16 z-10'>
        <div className='p-2 flex-nowrap rounded-md shadow-md'><FaUser />{session.user.email}</div>
        <div onClick={() => supabase.auth.signOut()} className='p-2 rounded-md shadow-md cursor-pointer'>Logout</div>
      </div>
      )}
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