// src/hooks/useBoardsCRUD.js
import useSupabaseCRUD from './useSupabaseCRUD';
    
const useBoardsCRUD = () => {
  const { loading, error, execute } = useSupabaseCRUD('boards');

  const createBoard = async (title, user_id) => {
    return execute(() => supabase.from('boards').insert([{ title, user_id }]).select().single());
  };

  const fetchBoards = async (user_id) => {
    return execute(() => supabase.from('boards').select('*').eq('user_id', user_id));
  };

  const updateBoard = async (id, title, user_id) => {
    return execute(() => supabase.from('boards').update({ title }).eq('id', id).eq('user_id', user_id));
  };

  const deleteBoard = async (id, user_id) => {
      return execute(() => supabase.from('boards').delete().eq('id', id).eq('user_id', user_id));
  };

  return {
    loading,
    error,
    createBoard,
    fetchBoards,
    updateBoard,
    deleteBoard,
  };
};

export default useBoardsCRUD;