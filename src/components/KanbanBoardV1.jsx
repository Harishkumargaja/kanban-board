// src/components/KanbanBoard.jsx
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import useStore from '../store';
import { FaPlus, FaTrashAlt, FaEdit, FaSave, FaTimes, FaStar, FaUser, FaShare } from 'react-icons/fa';
import { supabase } from '../supabaseClient';
import CardDetailsModal from './CardDetailsModal';

function KanbanBoardV1() {
  const boards = useStore((state) => state.boards);
  const lists = useStore((state) => state.lists);
  const cards = useStore((state) => state.cards);
  const fetchBoards = useStore((state) => state.fetchBoards);
  const fetchLists = useStore((state) => state.fetchLists);
  const fetchCards = useStore((state) => state.fetchCards);
  const addBoard = useStore((state) => state.addBoard);
  const updateBoard = useStore((state) => state.updateBoard);
  const removeBoard = useStore((state) => state.removeBoard);
  const addList = useStore((state) => state.addList);
  const addCard = useStore((state) => state.addCard);
  const updateCardPosition = useStore((state) => state.updateCardPosition);
  const updateListPosition = useStore((state) => state.updateListPosition);
  const removeCard = useStore((state) => state.removeCard);
  const removeList = useStore((state) => state.removeList);
  const updateList = useStore((state) => state.updateList);
  const updateCard = useStore((state) => state.updateCard);
  const selectedBoardId = useStore((state) => state.selectedBoardId);
  const selectedBoardTitle = useStore((state) => state.selectedBoardTitle);
  const setSelectedBoardId = useStore((state) => state.setSelectedBoardId);

  const [newListTitle, setNewListTitle] = useState('');
  const [newCardTitle, setNewCardTitle] = useState('');
  const [selectedListId, setSelectedListId] = useState(null);
  const [editingListId, setEditingListId] = useState(null);
  const [editedListTitle, setEditedListTitle] = useState('');
  const [editingCardId, setEditingCardId] = useState(null);
  const [editedCardTitle, setEditedCardTitle] = useState('');
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editedBoardTitle, setEditedBoardTitle] = useState('');
  const [userId, setUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); //search query [cite: 13]

  const highlightText = (text) => { //function to highlight the text [cite: 14, 15, 16]
    if (!searchQuery) return text;

    const regex = new RegExp(`(${searchQuery})`, 'gi');
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user.id);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id);
    });
  }, []);

  useEffect(() => {
    if (userId) {
      fetchBoards(userId);
    }
  }, [userId, fetchBoards]);

  useEffect(() => {
    if (selectedBoardId) {
      fetchLists(selectedBoardId);
    }
  }, [selectedBoardId, fetchLists]);

  useEffect(() => {
    if (lists.length > 0) {
      fetchCards(lists.map((list) => list.id));
    }
  }, [lists, fetchCards]);

  const handleAddBoard = (e) => {
    e.preventDefault();
    addBoard(newBoardTitle, userId);
    setNewBoardTitle('');
  };

  const handleAddList = (e) => {
    e.preventDefault();
    addList(newListTitle, selectedBoardId, lists.length);
    setNewListTitle('');
  };

  const handleAddCard = (e) => {
    e.preventDefault();
    if (selectedListId) {
      const listCards = cards.filter((card) => card.list_id === selectedListId);
      addCard(newCardTitle, selectedListId, listCards.length);
      setNewCardTitle('');
    }
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'card') {
      updateCardPosition(draggableId, destination.droppableId, destination.index);
    } else if (type === 'list') {
      const draggedList = lists.find((list) => list.id === draggableId);
      const otherLists = lists.filter((list) => list.id !== draggableId);
      const reorderedLists = [
        ...otherLists.slice(0, destination.index),
        draggedList,
        ...otherLists.slice(destination.index),
      ];
      reorderedLists.forEach((list, index) => {
        updateListPosition(list.id, index);
      });
    }
  };

  const handleEditList = (listId, title) => {
    setEditingListId(listId);
    setEditedListTitle(title);
  };

  const handleSaveListEdit = (listId) => {
    updateList(listId, editedListTitle, selectedBoardId);
    setEditingListId(null);
  };

  const handleCancelListEdit = () => {
    setEditingListId(null);
  };

  const handleEditCard = (cardId, title) => {
    setEditingCardId(cardId);
    setEditedCardTitle(title);
  };

  const handleSaveCardEdit = (cardId) => {
    updateCard(cardId, editedCardTitle);
    setEditingCardId(null);
  };

  const handleCancelCardEdit = () => {
    setEditingCardId(null);
  };

  const handleCardClick = (cardId) => {
    setSelectedCardId(cardId);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCardId(null);
  };

  const handleEditBoard = (boardId, title) => {
    setEditingBoardId(boardId);
    setEditedBoardTitle(title);
  };

  const handleSaveBoardEdit = (boardId) => {
    updateBoard(boardId, editedBoardTitle, userId);
    setEditingBoardId(null);
  };

  const handleCancelBoardEdit = () => {
    setEditingBoardId(null);
  };

  const handleDeleteBoard = async (boardId) => {
    try {
      if (!userId) {
        console.error('User ID not available.');
        return;
      }
      console.log(`Attempting to delete board with ID: ${boardId} for user: ${userId}`);
      await removeBoard(boardId, userId);
      console.log('Board deletion initiated.');
    } catch (err) {
      console.error('Error deleting board:', err);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 min-w-64 bg-blue-600 text-gray-200 p-8">
        <h2 className='text-3xl font-bold mb-5'>Boards</h2>
        <ul>
          {boards.map((board) => (
            <li key={board.id} className="flex items-center justify-between mb-3">
              {editingBoardId === board.id ? (
                <>
                  <input
                    type="text"
                    value={editedBoardTitle}
                    onChange={(e) => setEditedBoardTitle(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  <button className='text-green-500 mr-2' onClick={() => handleSaveBoardEdit(board.id)}><FaSave /></button>
                  <button className='text-red-500 ' onClick={handleCancelBoardEdit}><FaTimes /></button>
                </>
              ) : (
                <>
                  <span onClick={() => setSelectedBoardId(board.id, board.title)} className="cursor-pointer font-bold">{board.title}</span>
                  <div>
                    <button className='text-green-500 mr-2' onClick={() => handleEditBoard(board.id, board.title)}><FaEdit /></button>
                    <button className='text-red-500' onClick={() => handleDeleteBoard(board.id)}><FaTrashAlt /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddBoard} className="mb-4">
          <input
            type="text"
            value={newBoardTitle}
            onChange={(e) => setNewBoardTitle(e.target.value)}
            className="w-full p-2 border rounded-md"
          />
          <button type="submit" className="mt-2 bg-blue-500 text-white p-2 rounded-md w-full">+ Add Board</button>
        </form>
      </div>
      <div className="flex-1 bg-blue-500">
        {selectedBoardId && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col overflow-x-auto">
              <div className="flex bg-blue-200 p-2 justify-start items-left">
                <h2 className="text-2xl font-bold">{selectedBoardId ?
                  selectedBoardTitle : "select"} Board</h2>
                <div className='text-xl pl-5 mr-5'><FaStar /></div>
                <div className='text-xl pl-5'><FaShare /></div>
                <input //search bar [cite: 13]
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="p-2 border rounded-md bg-white ml-auto absolute top-2 right-12"
                />
              </div>
              <div className="flex overflow-x-auto">
                <Droppable droppableId="all-lists" direction="horizontal" type="list">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="flex flex-nowrap space-x-4"
                    >
                      {lists.map((list, index) => (
                        <Draggable key={list.id} draggableId={list.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="min-w-[300px] bg-gray-100 text-gray-600 rounded-md p-4 m-3 shadow-md relative group"
                            >
                              <div className="flex justify-between items-center">
                                {editingListId === list.id ? (
                                  <>
                                    <input
                                      type="text"
                                      value={editedListTitle}
                                      onChange={(e) => setEditedListTitle(e.target.value)}
                                      className="w-full p-2 border rounded-md"
                                    />
                                    <button className='text-green-500 mr-2' onClick={() => handleSaveListEdit(list.id)}><FaSave /></button>
                                    <button className='text-red-500' onClick={handleCancelListEdit}><FaTimes /></button>
                                  </>
                                ) : (
                                  <>
                                    <h3 className="font-semibold mb-2">{list.title}</h3>
                                    <div>
                                      <button className='text-green-500 mr-2' onClick={() => handleEditList(list.id, list.title)}><FaEdit /></button>
                                      <button onClick={() => removeList(list.id)} className="text-red-500"><FaTrashAlt /></button>
                                    </div>
                                  </>
                                )}
                              </div>
                              <Droppable droppableId={list.id} type="card">
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps}><br></br>
                                    {cards
                                      .filter((card) => card.list_id === list.id && card.title.toLowerCase().includes(searchQuery.toLowerCase())) //filtering cards [cite: 66]
                                      .sort((a, b) => a.position - b.position)
                                      .map((card, index) => (
                                        <Draggable key={card.id} draggableId={card.id} index={index}>
                                          {(provided) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              onClick={() => handleCardClick(card.id)}
                                              className="bg-gray-200 p-3 rounded-md shadow-sm mb-2 hover:shadow-md transition-shadow flex flex-row"
                                            >
                                              {editingCardId === card.id ? (
                                                <>
                                                  <input
                                                    type="text"
                                                    value={editedCardTitle}
                                                    onChange={(e) => setEditedCardTitle(e.target.value)}
                                                    className="w-full p-2 border rounded-md flex-grow"
                                                  />
                                                  <button className='text-green-500 mr-2' onClick={() => handleSaveCardEdit(card.id)}><FaSave /></button>
                                                  <button className='text-red-500' onClick={handleCancelCardEdit}><FaTimes /></button>
                                                </>
                                              ) : (
                                                <>
                                                  <div className='flex-grow'>{highlightText(card.title)}</div>  {/*highlighting the text [cite: 78]*/}
                                                  <div>
                                                    <button className='text-green-500 mr-2 flex-end' onClick={() => handleEditCard(card.id, card.title)}><FaEdit /></button>
                                                    <button onClick={() => removeCard(card.id)} className="text-red-500 flex-end"><FaTrashAlt /></button>
                                                  </div>
                                                </>
                                              )}
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>
                              <form onSubmit={handleAddCard} className="mt-2">
                                <input
                                  type="text"
                                  value={newCardTitle}
                                  onChange={(e) => setNewCardTitle(e.target.value)}
                                  placeholder="Add card title"
                                  className="w-full p-2 border rounded-md"
                                />
                                <button type="submit" onClick={() => setSelectedListId(list.id)} className="mt-2 bg-blue-500 text-white p-2 rounded-md w-full">Add Card</button>
                              </form>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      <div className="min-w-[300px] bg-gray-100 text-gray-600 rounded-md p-4 m-3 shadow-md relative group">
                        <form onSubmit={handleAddList} className="p-4">
                          <input
                            type="text"
                            value={newListTitle}
                            onChange={(e) => setNewListTitle(e.target.value)}
                            placeholder="Add list title"
                            className="w-full p-2 border rounded-md"
                          />
                          <button type="submit" className="mt-2 bg-green-500 text-white p-2 rounded-md w-full">Add List</button>
                        </form>
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        )}
        {isModalOpen && <CardDetailsModal cardId={selectedCardId} onClose={handleModalClose} />}
      </div>
    </div>
  );
}

export default KanbanBoardV1;