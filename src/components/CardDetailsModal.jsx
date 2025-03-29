// src/components/CardDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import useStore from '../store';
import { FaTimes, FaPaperclip } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

function CardDetailsModal({ cardId, onClose }) {
  const cardDetails = useStore((state) => state.selectedCardDetails);
  const fetchCardDetails = useStore((state) => state.fetchCardDetails);
  const updateCardDetails = useStore((state) => state.updateCardDetails);
  const addComment = useStore((state) => state.addComment);
  const fetchComments = useStore((state) => state.fetchComments);

  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (cardId) {
      fetchCardDetails(cardId);
    }
  }, [cardId, fetchCardDetails]);

  useEffect(() => {
    if (cardDetails) {
      setDescription(cardDetails.description || '');
      setAttachments(cardDetails.attachments || []);
    }
  }, [cardDetails]);

  useEffect(() => {
    if(cardId){
        fetchComments(cardId).then(setComments);
    }
  }, [cardId])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id);
    });
  }, []);

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSave = () => {
    updateCardDetails(cardId, description, attachments);
    onClose();
  };

  const handleAddComment = () => {
    if (userId && newComment) {
      addComment(cardId, userId, newComment);
      setNewComment('');
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachments([...attachments, file.name]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-4 rounded-md w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Card Details</h2>
          <button onClick={onClose}><FaTimes /></button>
        </div>
        <div>
          <label className="block mb-2">Description:</label>
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            className="w-full border p-2 rounded-md"
          />
        </div>
        <div className="mt-4">
          <label className="block mb-2">Attachments:</label>
          <input type="file" onChange={handleAttachmentChange} />
          <ul>
            {attachments.map((attachment, index) => (
              <li key={index}>{attachment}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <label className="block mb-2">Comments:</label>
          <div className="space-y-2">
            {comments.map((comment) => (
              <div key={comment.id} className="border p-2 rounded-md">
                <p>{comment.text}</p>
              </div>
            ))}
          </div>
          <div className="flex mt-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow border p-2 rounded-md mr-2"
            />
            <button onClick={handleAddComment} className="bg-blue-500 text-white p-2 rounded-md">Add</button>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={handleSave} className="bg-green-500 text-white p-2 rounded-md">Save</button>
        </div>
      </div>
    </div>
  );
}

export default CardDetailsModal;