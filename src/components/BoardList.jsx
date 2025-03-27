// src/components/BoardList.jsx
import React, { useEffect } from 'react';
import useStore from '../store';
import { supabase } from '../supabaseClient';
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';


function BoardList() {
  const boards = useStore((state) => state.boards);
  const fetchBoards = useStore((state) => state.fetchBoards);
  const addBoard = useStore((state) => state.addBoard);
  const removeBoard = useStore(state => state.removeBoard);
  const setSelectedBoardId = useStore((state) => state.setSelectedBoardId);
  const [newBoardTitle, setNewBoardTitle] = React.useState(''); // Corrected line
  const [userId, setUserId] = React.useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id);
    });
  }, []);

  useEffect(() => {
    if(userId){
      fetchBoards(userId);
    }
  }, [userId, fetchBoards]);

  const handleAddBoard = (e) => {
    e.preventDefault();
    addBoard(newBoardTitle, userId);
    setNewBoardTitle('');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-gray-500 p-8 rounded-md shadow-md w-96">
      <h2 className="text-2xl font-semibold mb-4 text-center">Boards</h2>
      <form onSubmit={handleAddBoard}>
        <input className="bg-amber-100 w-full p-2 mb-2 border rounded-md" type="text" value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} />
        <button type="submit">+ Add Board</button>
      </form>
      <ul>
        {boards.map((board) => (
          <li key={board.id} onClick={() => setSelectedBoardId(board.id,board.title)}>
            <div className="bg-yellow-300 p-3 rounded-md shadow-sm mb-2 hover:shadow-md transition-shadow flex justify-between items-center">{board.title}
            <button onClick={() => removeBoard(board.id)} className="text-red-500">
              <FaTrashAlt />
            </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default BoardList;