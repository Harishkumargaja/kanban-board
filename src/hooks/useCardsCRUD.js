// src/hooks/useCardsCRUD.js
import { useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import useStore from '../store'; // Import Zustand store [cite: 12, 36]

const useCardsCRUD = () => {
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState(null);

 const { addCard, fetchCards: fetchCardsFromStore, updateCard: updateCardInStore, removeCard: removeCardFromStore } = useStore(); // Get Zustand actions [cite: 42, 43, 46, 47, 50, 51]

 const createCard = useCallback(async (title, list_id, position, description = '', attachments = []) => {
  setLoading(true);
  setError(null);
  try {
   const { data, error } = await supabase
     .from('cards')
     .insert([{ title, list_id, position, description, attachments }])
     .select()
     .single();
   if (error) {
    setError(error);
    return null;
   }
   if (data) {
    addCard(data); // Update Zustand store [cite: 46, 47]
   }
   return data;
  } catch (err) {
   setError(err);
   return null;
  } finally {
   setLoading(false);
  }
 }, [addCard]); // Dependency on addCard

 const fetchCards = useCallback(async (list_ids) => {
  setLoading(true);
  setError(null);
  try {
   const { data, error } = await supabase
     .from('cards')
     .select('*')
     .in('list_id', list_ids)
     .order('position', { ascending: true });
   if (error) {
    setError(error);
    return [];
   }
   if (data) {
    fetchCardsFromStore(data); // Update Zustand store [cite: 42, 43]
   }
   return data;
  } catch (err) {
   setError(err);
   return [];
  } finally {
   setLoading(false);
  }
 }, [fetchCardsFromStore]); // Dependency on fetchCardsFromStore

 const updateCard = useCallback(async (id, title) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('cards')
     .update({ title })
     .eq('id', id);
   if (error) {
    setError(error);
    return false;
   }
   updateCardInStore(id, title); // Update Zustand store [cite: 53, 54]
   return true;
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, [updateCardInStore]); // Dependency on updateCardInStore

 const deleteCard = useCallback(async (id) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('cards')
     .delete()
     .eq('id', id);
   if (error) {
    setError(error);
    return false;
   }
   removeCardFromStore(id); // Update Zustand store [cite: 50, 51]
   return true;
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, [removeCardFromStore]); // Dependency on removeCardFromStore

 const updateCardPosition = useCallback(async (id, list_id, position) => {
  setLoading(true);
  setError(null);
  try {
   const { error } = await supabase
     .from('cards')
     .update({ list_id, position })
     .eq('id', id);
   if (error) {
    setError(error);
    return false;
   }
   return true; // Don't update Zustand here, KanbanBoard.jsx does this after drag
  } catch (err) {
   setError(err);
   return false;
  } finally {
   setLoading(false);
  }
 }, []); // No dependencies (KanbanBoard.jsx handles Zustand update)

 return {
  loading,
  error,
  createCard,
  fetchCards,
  updateCard,
  deleteCard,
  updateCardPosition,
 };
};

export default useCardsCRUD;
