// src/components/BoardList.jsx
import React, { useEffect } from 'react';
import useStore from '../store';
import { supabase } from '../supabaseClient';

function BoardList() {
  const boards = useStore((state) => state.boards);
  const fetchBoards = useStore((state) => state.fetchBoards);
  const addBoard = useStore((state) => state.addBoard);
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
    <div>
      <h2>Boards</h2>
      <form onSubmit={handleAddBoard}>
        <input type="text" value={newBoardTitle} onChange={(e) => setNewBoardTitle(e.target.value)} />
        <button type="submit">Add Board</button>
      </form>
      <ul>
        {boards.map((board) => (
          <li key={board.id} onClick={() => setSelectedBoardId(board.id)}>
            {board.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BoardList;