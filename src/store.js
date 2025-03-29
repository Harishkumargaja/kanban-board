// src/store.js
import { create } from 'zustand';
import { supabase } from './supabaseClient';

const useStore = create((set, get) => ({
  boards: [],
  lists: [],
  cards: [],
  selectedBoardId: null,

  fetchBoards: async (userId) => {
    const { data, error } = await supabase.from('boards').select('*').eq('user_id', userId);
    if (error) console.error('Error fetching boards:', error);
    set({ boards: data || [] });
  },

  updateBoard: async (boardId, title, userId) => {
    const { error } = await supabase.from('boards').update({ title }).eq('id', boardId);
    if (error) console.error('Error updating board:', error);
    get().fetchBoards(userId);
  },


  removeBoard: async (boardId, userId) => {
    try {
      console.log(`Attempting to delete board with ID: ${boardId}`);
      const { error } = await supabase.from('boards').delete().eq('id', boardId);
      if (error) {
        console.error('Error deleting board:', error);
        return; // Exit if there's an error
      }
      console.log(`Board with ID: ${boardId} deleted successfully.`);
      get().fetchBoards(userId);
      set({ selectedBoardId: null });
    } catch (err) {
      console.error('An unexpected error occurred:', err);
    }
  },


  fetchLists: async (boardId) => {
    const { data, error } = await supabase.from('lists').select('*').eq('board_id', boardId).order('position');
    if (error) console.error('Error fetching lists:', error);
    set({ lists: data || [] });
  },

  fetchCards: async (listIds) => {
    if (!listIds || listIds.length === 0) {
      set({ cards: [] });
      return;
    }
    const { data, error } = await supabase.from('cards').select('*').in('list_id', listIds).order('position');
    if (error) console.error('Error fetching cards:', error);
    set({ cards: data || [] });
  },

  addBoard: async (title, userId) => {
    const { error } = await supabase.from('boards').insert([{ title, user_id: userId }]);
    if (error) console.error('Error adding board:', error);
    get().fetchBoards(userId);
  },

  addList: async (title, boardId, position) => {
    const { error } = await supabase.from('lists').insert([{ title, board_id: boardId, position }]);
    if (error) console.error('Error adding list:', error);
    get().fetchLists(boardId);
  },

  addCard: async (title, listId, position, description = '') => {
    const { error } = await supabase.from('cards').insert([{ title, list_id: listId, position, description }]);
    if (error) console.error('Error adding card:', error);
    get().fetchCards(get().lists.map((list) => list.id));
  },

  updateCardPosition: async (cardId, listId, position) => {
    const { error } = await supabase.from('cards').update({ list_id: listId, position }).eq('id', cardId);
    if (error) console.error('Error updating card position:', error);
    get().fetchCards(get().lists.map((list) => list.id));
  },
  updateListPosition: async (listId, position) => {
    const {error} = await supabase.from('lists').update({position}).eq('id', listId);
    if(error) console.error('Error updating list position:', error);
    get().fetchLists(get().selectedBoardId);
  },

  removeCard: async (cardId) => {
    const { error } = await supabase.from('cards').delete().eq('id', cardId);
    if (error) console.error('Error deleting card:', error);
    get().fetchCards(get().lists.map((list) => list.id));
  },

  removeList: async (listId) => {
    const { error } = await supabase.from('lists').delete().eq('id', listId);
    if (error) console.error('Error deleting list:', error);
    get().fetchLists(get().selectedBoardId);
  },

  updateList: async (listId, title, boardId) => {
    const { error } = await supabase.from('lists').update({ title }).eq('id', listId);
    if (error) console.error('Error updating list:', error);
    get().fetchLists(boardId);
  },

  updateCard: async (cardId, title) => {
    const { error } = await supabase.from('cards').update({ title }).eq('id', cardId);
    if (error) console.error('Error updating card:', error);
    get().fetchCards(get().lists.map((list) => list.id));
  },

  setSelectedBoardId: (boardId,boardTitle) => {
    set({ selectedBoardId: boardId,selectedBoardTitle:boardTitle });
  },
}));



export default useStore;