// src/hooks/useBoardsCRUD.js
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import useStore from '../store';

const useBoardsCRUD = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const boards = useStore((state) => state.boards);
  const addBoardToStore = useStore((state) => state.addBoard);
  const updateBoardInStore = useStore((state) => state.updateBoard);
  const removeBoardFromStore = useStore((state) => state.removeBoard);

  const createBoard = async (title, userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('boards')
        .insert([{ title, user_id: userId }])
        .select();
      if (error) {
        throw new Error(error.message);
      }
      if (data && data.length > 0) {
        addBoardToStore(data[0]); // Zustand update
      }
      return data;
    } catch (err) {
      setError(err);
      console.error("Error creating board:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoards = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('boards')
        .select('*') //  Fetch all columns including favorite
        .eq('user_id', userId);
      if (error) {
        throw new Error(error.message);
      }
      useStore.setState({ boards: data }); // Zustand update
      return data;
    } catch (err) {
      setError(err);
      console.error("Error fetching boards:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateBoard = async (id, title, userId) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('boards')
        .update({ title })
        .eq('id', id)
        .eq('user_id', userId)
        .select();
      if (error) {
        throw new Error(error.message);
      }
      if (data && data.length > 0) {
        updateBoardInStore(id, title); // Zustand update
      }
      return data;
    } catch (err) {
      setError(err);
      console.error("Error updating board:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBoard = async (id, userId) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('boards')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) {
        throw new Error(error.message);
      }
      removeBoardFromStore(id); // Zustand update
    } catch (err) {
      setError(err);
      console.error("Error deleting board:", err);
    } finally {
      setLoading(false);
    }
  };

  // New function to toggle favorite status
  const toggleFavoriteBoard = async (boardId, userId, isCurrentlyFavorite) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('boards')
        .update({ favorite: !isCurrentlyFavorite })
        .eq('id', boardId)
        .eq('user_id', userId);
      if (error) {
        throw new Error(error.message);
      }

      // Optimistically update Zustand store
      const updatedBoards = boards.map(board =>
        board.id === boardId ? { ...board, favorite: !isCurrentlyFavorite } : board
      );
      useStore.setState({ boards: updatedBoards });

    } catch (err) {
      setError(err);
      console.error("Error toggling favorite:", err);
      // Optionally, revert Zustand store changes on error
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createBoard,
    fetchBoards,
    updateBoard,
    deleteBoard,
    toggleFavoriteBoard //  Include the new function
  };
};

export default useBoardsCRUD;