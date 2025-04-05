   // src/hooks/useListsCRUD.js
   import useSupabaseCRUD from './useSupabaseCRUD';
    
   const useListsCRUD = () => {
     const { loading, error, execute } = useSupabaseCRUD('lists');
   
     const createList = async (title, board_id, position) => {
       return execute(() => supabase.from('lists').insert([{ title, board_id, position }]).select().single());
     };
   
     const fetchLists = async (board_id) => {
       return execute(() => supabase.from('lists').select('*').eq('board_id', board_id).order('position', { ascending: true }));
     };
   
     const updateList = async (id, title, board_id) => {
       return execute(() => supabase.from('lists').update({ title }).eq('id', id).eq('board_id', board_id));
     };
   
     const deleteList = async (id) => {
       return execute(() => supabase.from('lists').delete().eq('id', id));
     };
   
     const updateListPosition = async (id, position) => {
       return execute(() => supabase.from('lists').update({ position }).eq('id', id));
     };
   
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