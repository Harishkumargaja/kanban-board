// src/hooks/useBoardsCRUD.js
import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import useStore from '../store'; // Import Zustand store [cite: 1, 36]

function useBoardsCRUD() {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const { addBoard, fetchBoards: fetchBoardsFromStore, updateBoard: updateBoardInStore, removeBoard: removeBoardFromStore } = useStore(); // Get Zustand actions [cite: 36, 37, 38, 39]

 const createBoard = useCallback(async (title, userId) => {
  setLoading(true);
  setError(null);
  try {
   const { data, error } = await supabase
     .from('boards')
     .insert([{ title, user_id: userId }])
     .select()
     .single();
   if (error) {
    setError(error);
    return null;
   }
   if (data) {
     addBoard(data); // Update Zustand store [cite: 44, 45]
   }
   return data;
  } catch (err) {
   setError(err);
   return null;
  } finally {
   setLoading(false);
  }
 }, [addBoard]); // Dependency on addBoard

 const fetchBoards = useCallback(async (userId) => {
  setLoading(true);
  setError(null);
  try {
   const { data, error } = await supabase
     .from('boards')
     .select('*')
     .eq('user_id', userId);
   if (error) {
    setError(error);
    return [];
   }
   if (data) {
    fetchBoardsFromStore(data); // Update Zustand store [cite: 36, 37]
   }
   return data;
  } catch (err) {
   setError(err);
   return [];
  } finally {
   setLoading(false);
  }
 }, [fetchBoardsFromStore]); // Dependency on fetchBoardsFromStore

 const updateBoard = useCallback(async (id, title, userId) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('boards')
     .update({ title })
     .eq('id', id)
     .eq('user_id', userId);
   if (error) {
    setError(error);
    return false;
   }
   updateBoardInStore(id, title, userId); // Update Zustand store [cite: 37]
   return true;
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, [updateBoardInStore]); // Dependency on updateBoardInStore

 const deleteBoard = useCallback(async (id, userId) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('boards')
     .delete()
     .eq('id', id)
     .eq('user_id', userId);
   if (error) {
    setError(error);
    return false;
   }
   removeBoardFromStore(id, userId); // Update Zustand store [cite: 38, 39]
   return true;
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, [removeBoardFromStore]); // Dependency on removeBoardFromStore

 return {
  loading,
  error,
  createBoard,
  fetchBoards,
  updateBoard,
  deleteBoard,
 };
}

export default useBoardsCRUD;
