 // src/hooks/useSupabaseCRUD.js
 import { useState } from 'react';
 import { supabase } from '../supabaseClient';
 
 const useSupabaseCRUD = (tableName) => {
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
 
   const execute = async (operation) => {
     setLoading(true);
     setError(null);
     try {
       const { data, error } = await operation();
       if (error) {
         setError(error);
         console.error(`Supabase ${tableName} error:`, error);
       }
       return data;
     } catch (err) {
       setError(err);
       console.error(`Supabase ${tableName} error:`, err);
       throw err; // Rethrow to potentially handle it in the component
     } finally {
       setLoading(false);
     }
   };
 
   return { loading, error, execute };
 };
 
 export default useSupabaseCRUD;