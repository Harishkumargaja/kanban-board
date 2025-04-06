// src/hooks/useListsCRUD.js
import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import useStore from '../store'; // Import Zustand store [cite: 20, 36]

const useListsCRUD = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const { addList, fetchLists: fetchListsFromStore, updateList: updateListInStore, removeList: removeListFromStore } = useStore(); // Get Zustand actions [cite: 40, 41, 51, 52]

 const createList = useCallback(async (title, board_id, position) => {
  setLoading(true);
  setError(null);
  try {
   const { data, error } = await supabase
     .from('lists')
     .insert([{ title, board_id, position }])
     .select()
     .single();
   if (error) {
    setError(error);
    return null;
   }
   if (data) {
    addList(data); // Update Zustand store [cite: 45, 46]
   }
   return data;
  } catch (err) {
   setError(err);
   return null;
  } finally {
   setLoading(false);
  }
 }, [addList]); // Dependency on addList

 const fetchLists = useCallback(async (board_id) => {
  setLoading(true);
  setError(null);
  try {
   const { data, error } = await supabase
     .from('lists')
     .select('*')
     .eq('board_id', board_id)
     .order('position', { ascending: true });
   if (error) {
    setError(error);
    return [];
   }
   if (data) {
    fetchListsFromStore(data); // Update Zustand store [cite: 40, 41]
   }
   return data;
  } catch (err) {
   setError(err);
   return [];
  } finally {
   setLoading(false);
  }
 }, [fetchListsFromStore]); // Dependency on fetchListsFromStore

 const updateList = useCallback(async (id, title, board_id) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('lists')
     .update({ title })
     .eq('id', id)
     .eq('board_id', board_id);
   if (error) {
    setError(error);
    return false;
   }
   updateListInStore(id, title, board_id); // Update Zustand store [cite: 52, 53]
   return true;
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, [updateListInStore]); // Dependency on updateListInStore

 const deleteList = useCallback(async (id) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('lists')
     .delete()
     .eq('id', id);
   if (error) {
    setError(error);
    return false;
   }
   removeListFromStore(id); // Update Zustand store [cite: 51, 52]
   return true;
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, [removeListFromStore]); // Dependency on removeListFromStore

 const updateListPosition = useCallback(async (id, position) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('lists')
     .update({ position })
     .eq('id', id);
   if (error) {
    setError(error);
    return false;
   }
   return true; //  Don't update Zustand here, KanbanBoard.jsx does this after drag
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, []); // No dependencies (we don't update Zustand here)

 return {
  loading,
  error,
  createList,
  fetchLists,
  updateList,
  deleteList,
  updateListPosition,
 };
};

export default useListsCRUD;
