// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';
import KanbanBoard from './components/KanbanBoard';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa6';

function App() {
  const [session, setSession] = useState(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const divRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setImagePreviewUrl(URL.createObjectURL(file));

    try {
      if (!file) return;

      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(`public/${session.user.id}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Error uploading image:", error);
      } else {
        console.log("Image uploaded successfully:", data);
        await updateUserProfile(session.user.id, `public/${session.user.id}`);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const updateUserProfile = async (userId, avatarUrl) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: userId, avatar_url: avatarUrl }, { returning: 'minimal' });
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('No profile found for user:', userId, error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null); // Clear the local session state
    navigate('/login'); // Redirect to login page
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

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      // if (session?.user) {
      //   const profileData = await fetchUserProfile(session.user.id);
      //   if (profileData?.avatar_url) {
      //     const { data: imageData, error: storageError } = await supabase.storage
      //       .from('avatars')
      //       .getPublicUrl(profileData.avatar_url);

      //     if (storageError) {
      //       console.error("Error getting public URL:", storageError);
      //     } else {
      //       setImagePreviewUrl(imageData.publicUrl);
      //     }
      //   } else {
      //     setImagePreviewUrl(''); // Clear preview if no avatar
      //   }
      // } else {
      //   setImagePreviewUrl(''); // Clear preview on logout
      // }
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
  }else{


  return (
    <div className="h-screen">
      <div className="bg-blue-800 text-white p-2 flex flex-row">
        <h3 className="text-2xl font-semibold text-left flex-none align-middle">Harish's Kanban Board</h3>
        <div className='flex-grow'></div>
        <div onClick={() => handleToggle()} className="items-center flex-end text-2xl cursor-pointer m-2">
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="User" className="rounded-full h-8 w-8" />
          ) : (
            <FaUser className="text-2xl" />
          )}
        </div>

        {isOpen && (
          <div ref={divRef} className='bg-gray-500 absolute text-2xl text-gray-800 right-2 top-16 z-10'>
            <div className='p-2 flex-nowrap rounded-md shadow-md'><FaUser />{session.user.email}</div>
            <label htmlFor='image-upload' className='cursor-pointer m-2'> Upload user image
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div onClick={handleLogout} className='p-2 rounded-md shadow-md cursor-pointer'>Logout</div>
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
}


export default App;