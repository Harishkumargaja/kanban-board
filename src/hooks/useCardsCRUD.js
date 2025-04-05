  // src/hooks/useCardsCRUD.js
  import useSupabaseCRUD from './useSupabaseCRUD';
    
  const useCardsCRUD = () => {
    const { loading, error, execute } = useSupabaseCRUD('cards');
  
    const createCard = async (title, list_id, position) => {
      return execute(() => supabase.from('cards').insert([{ title, list_id, position }]).select().single());
    };
  
    const fetchCards = async (list_ids) => {
      return execute(() => supabase.from('cards').select('*').in('list_id', list_ids).order('position', { ascending: true }));
    };
  
    const updateCard = async (id, title) => {
      return execute(() => supabase.from('cards').update({ title }).eq('id', id));
    };
  
    const deleteCard = async (id) => {
      return execute(() => supabase.from('cards').delete().eq('id', id));
    };
  
     const updateCardPosition = async (id, list_id, position) => {
        return execute(() => supabase.from('cards').update({ list_id, position }).eq('id', id));
     };
  
    return {
      loading,
      error,
      createCard,
      fetchCards,
      updateCard,
      deleteCard,
      updateCardPosition
    };
  };
  
  export default useCardsCRUD;
