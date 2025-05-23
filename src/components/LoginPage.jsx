// src/components/LoginPage.jsx
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      console.log(authError);
      setError(authError.message);
    } else {
      navigate('/'); // Redirect to the main app
    }
  };

  return (
    <div className="h-screen">
      <h1 className="text-2xl font-semibold text-center p-4 bg-gray-800 text-white">Harish's Kanban Board</h1>
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-gray-500 p-8 rounded-md shadow-md w-96  text-black">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-amber-100 text-black w-full p-2 mb-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-amber-100 text-black w-full p-2 mb-4 border rounded-md"
          />
          <button
            type="submit"
            className={`w-full mb-4 bg-blue-500 text-white p-4 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <button
            className={'w-full mb-4 text-white p-4 rounded-md'}
            onClick={() => navigate('/signup')}
          >Signup</button>
        </form>
      </div>
    </div>
    </div>
  );
}

export default LoginPage;