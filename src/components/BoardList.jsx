// src/components/BoardList.jsx
import React, { useEffect } from 'react';
import useStore from '../store';
import { supabase } from '../supabaseClient';
import { FaEdit, FaTrashAlt, FaSave, FaTimes } from 'react-icons/fa';


function BoardList() {
  const boards = useStore((state) => state.boards);
  const fetchBoards = useStore((state) => state.fetchBoards);
  const addBoard = useStore((state) => state.addBoard);
  const updateBoard = useStore((state) => state.updateBoard);
  const removeBoard = useStore(state => state.removeBoard);
  const setSelectedBoardId = useStore((state) => state.setSelectedBoardId);
  const [newBoardTitle, setNewBoardTitle] = React.useState(''); // Corrected line
  const [userId, setUserId] = React.useState(null);
  const [editingBoardId, setEditingBoardId] = React.useState(null);
  const [editedTitle, setEditedTitle] = React.useState('');

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

  const handleDelete = (boardId) => {
    removeBoard(boardId);
  };

  const handleEdit = (boardId, title) => {
    setEditingBoardId(boardId);
    setEditedTitle(title);
  };

  const handleSaveEdit = (boardId) => {
    updateBoard(boardId, editedTitle, userId);
    setEditingBoardId(null);
  };

  const handleCancelEdit = () => {
    setEditingBoardId(null);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-200">
      <div className="bg-gray-500 p-8 rounded-md shadow-md w-96">
      <h2 className="text-2xl font-semibold mb-4 text-center">Boards</h2>
      <form onSubmit={handleAddBoard}>
        <input className="bg-amber-100 text-black w-full p-2 mb-2 border rounded-md" type="text" value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} />
        <button className="p-2 mb-2 border rounded-md text-white" type="submit">+ Add Board</button>
      </form>
      <ul>
        {boards.map((board) => (
          <li key={board.id} className="flex items-center justify-between">
          {editingBoardId === board.id ? (
            <>
              <input
                className="bg-yellow-300 p-3 rounded-md shadow-sm mb-2 hover:shadow-md transition-shadow flex justify-between items-center"
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
              <button className="text-green-500" onClick={() => handleSaveEdit(board.id)}>
                <FaSave />
              </button>
              <button className="text-red-500" onClick={handleCancelEdit}>
                <FaTimes />
              </button>
            </>
          ) : (
            <>
              <span className="bg-yellow-300 p-3 rounded-md shadow-sm mb-2 hover:shadow-md transition-shadow flex justify-between items-center"
               onClick={() => setSelectedBoardId(board.id,board.title)}>
                {board.title}
              </span>
              <div>
                <button className="text-green-500" onClick={() => handleEdit(board.id, board.title)}>
                  <FaEdit />
                </button>
                &nbsp;
                <button className="text-red-500" onClick={() => handleDelete(board.id)}>
                  <FaTrashAlt />
                </button>
              </div>
            </>
          )}
        </li>
        ))}
      </ul>
    </div>
    </div>
  );
}

export default BoardList;