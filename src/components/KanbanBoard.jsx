 // src/components/KanbanBoard.jsx
 import React, { useEffect, useState } from 'react';
 import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
 import useStore from '../store';
 import { FaPlus, FaTrashAlt, FaEdit, FaSave, FaTimes, FaStar, FaUser, FaShare } from 'react-icons/fa';
 import { supabase } from '../supabaseClient';
 import CardDetailsModal from './CardDetailsModal';
 import useBoardsCRUD from '../hooks/useBoardsCRUD'; // Import the custom hooks
 import useListsCRUD from '../hooks/useListsCRUD';
 import useCardsCRUD from '../hooks/useCardsCRUD';
 
 function KanbanBoard() {
   const boardsFromStore = useStore((state) => state.boards);
   const listsFromStore = useStore((state) => state.lists);
   const cardsFromStore = useStore((state) => state.cards);
   const fetchBoardsFromStore = useStore((state) => state.fetchBoards);
   const fetchListsFromStore = useStore((state) => state.fetchLists);
   const fetchCardsFromStore = useStore((state) => state.fetchCards);
   const addBoardToStore = useStore((state) => state.addBoard);
   const updateBoardInStore = useStore((state) => state.updateBoard);
   const removeBoardFromStore = useStore((state) => state.removeBoard);
   const addListToStore = useStore((state) => state.addList);
   const addCardToStore = useStore((state) => state.addCard);
   const updateCardPositionInStore = useStore((state) => state.updateCardPosition);
   const updateListPositionInStore = useStore((state) => state.updateListPosition);
   const removeCardFromStore = useStore((state) => state.removeCard);
   const removeListFromStore = useStore((state) => state.removeList);
   const updateListInStore = useStore((state) => state.updateList);
   const updateCardInStore = useStore((state) => state.updateCard);
   const selectedBoardIdFromStore = useStore((state) => state.selectedBoardId);
   const selectedBoardTitleFromStore = useStore((state) => state.selectedBoardTitle);
   const setSelectedBoardIdInStore = useStore((state) => state.setSelectedBoardId);
 
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
   const [searchQuery, setSearchQuery] = useState('');
 
   const {
     loading: boardsLoading,
     error: boardsError,
     createBoard,
     fetchBoards,
     updateBoard,
     deleteBoard,
   } = useBoardsCRUD();
   const {
     loading: listsLoading,
     error: listsError,
     createList,
     fetchLists,
     updateList,
     deleteList: deleteListFromDB,
     updateListPosition,
   } = useListsCRUD();
   const {
     loading: cardsLoading,
     error: cardsError,
     createCard,
     fetchCards,
     updateCard,
     deleteCard: deleteCardFromDB,
     updateCardPosition: updateCardPositionInDB,
   } = useCardsCRUD();
 
   const highlightText = (text) => {
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
       fetchBoardsFromStore(userId);
     }
   }, [userId, fetchBoards]);
 
   useEffect(() => {
     if (selectedBoardIdFromStore) {
       fetchListsFromStore(selectedBoardIdFromStore);
     }
   }, [selectedBoardIdFromStore, fetchLists]);
 
   useEffect(() => {
     if (listsFromStore.length > 0) {
       fetchCardsFromStore(listsFromStore.map((list) => list.id));
     }
   }, [listsFromStore, fetchCards]);
 
   const handleAddBoard = async (e) => {
     e.preventDefault();
     try {
         addBoardToStore(newBoardTitle, userId);
         setNewBoardTitle('');
     } catch (err) {      
      console.error('Error deleting card:', err);
     }
   };
 
   const handleAddList = async (e) => {
     e.preventDefault();
     try {
      addListToStore(newListTitle, selectedBoardIdFromStore, listsFromStore.length);
         setNewListTitle('');
     } catch (err) {
      console.error('Error deleting card:', err);
     }
   };
 
   const handleAddCard = async (e) => {
     e.preventDefault();
     if (selectedListId) {
       try {
           addCardToStore(newCardTitle, selectedListId, cardsFromStore.filter((card) => card.list_id === selectedListId).length);
           setNewCardTitle('');
       } catch (err) {
        console.error('Error deleting card:', err);
       }
     }
   };
 
   const onDragEnd = (result) => {
     const { destination, source, draggableId, type } = result;
 
     if (!destination) return;
 
     if (destination.droppableId === source.droppableId && destination.index === source.index) return;
 
     if (type === 'card') {
       updateCardPositionInStore(draggableId, destination.droppableId, destination.index);
     } else if (type === 'list') {
       const draggedList = listsFromStore.find((list) => list.id === draggableId);
       const otherLists = listsFromStore.filter((list) => list.id !== draggableId);
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
 
   const handleSaveListEdit = async (listId) => {
     try {
       await updateList(listId, editedListTitle, selectedBoardIdFromStore);
       updateListInStore(listId, editedListTitle, selectedBoardIdFromStore);
       setEditingListId(null);
     } catch (err) {
      console.error('Error deleting card:', err);
     }
   };
 
   const handleCancelListEdit = () => {
     setEditingListId(null);
   };
 
   const handleEditCard = (cardId, title) => {
     setEditingCardId(cardId);
     setEditedCardTitle(title);
   };
 
   const handleSaveCardEdit = async (cardId) => {
     try {
       await updateCard(cardId, editedCardTitle);
       updateCardInStore(cardId, editedCardTitle);
       setEditingCardId(null);
     } catch (err) {
      console.error('Error deleting card:', err);
     }
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
 
   const handleSaveBoardEdit = async (boardId) => {
     try {
       await updateBoard(boardId, editedBoardTitle, userId);
       updateBoardInStore(boardId, editedBoardTitle, userId);
       setEditingBoardId(null);
     } catch (err) {
      console.error('Error deleting card:', err);
     }
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
       await deleteBoard(boardId, userId);
       removeBoardFromStore(boardId);
     } catch (err) {
      console.error('Error deleting card:', err);
     }
   };
 
   const handleDeleteList = async (listId) => {
     try {
       await deleteListFromDB(listId);
       removeListFromStore(listId);
     } catch (err) {
      console.error('Error deleting card:', err);
     }
   };
 
   const handleDeleteCard = async (cardId) => {
     try {
       await deleteCardFromDB(cardId);
       removeCardFromStore(cardId);
     } catch (err) {
       console.error('Error deleting card:', err);
     }
   };
 
   const handleUpdateCardPosition = async (id, list_id, position) => {
     try {
       await updateCardPositionInDB(id, list_id, position);
       updateCardPositionInStore(id, list_id, position);
     } catch (err) {
      console.error('Error deleting card:', err);
     }
   };
 
   const handleUpdateListPosition = async (id, position) => {
     try {
       await updateListPosition(id, position);
       updateListPositionInStore(id, position);
     } catch (err) {
      console.error('Error deleting card:', err);
     }
   };
   
   return (
    <div className="flex h-screen">
      <div className="w-64 min-w-64 bg-blue-600 text-gray-200 p-8">
        <h2 className='text-3xl font-bold mb-5'>Boards</h2>
        <ul>
          {boardsFromStore.map((board) => (
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
                  <span onClick={() => setSelectedBoardIdInStore(board.id, board.title)} className="cursor-pointer font-bold">{board.title}</span>
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
        {selectedBoardIdFromStore && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex flex-col overflow-x-auto">
              <div className="flex bg-blue-200 p-2 justify-start items-left">
                <h2 className="text-2xl font-bold">{selectedBoardIdFromStore ?
                  selectedBoardTitleFromStore : "select"} Board</h2>
                <div className='text-xl pl-5 mr-5'><FaStar /></div>
                <div className='text-xl pl-5'><FaShare /></div>
                <input //search bar
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="p-2 border rounded-md ml-auto absolute right-12 top-2 w-1/4 bg-white text-gray-800"
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
                      {listsFromStore.map((list, index) => (
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
                                      <button onClick={() => handleDeleteList(list.id)} className="text-red-500"><FaTrashAlt /></button>
                                    </div>
                                  </>
                                )}
                              </div>
                              <Droppable droppableId={list.id} type="card">
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps}><br></br>
                                    {cardsFromStore
                                      .filter((card) => card.list_id === list.id && card.title.toLowerCase().includes(searchQuery.toLowerCase())) //filtering cards
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
                                                  <div className='flex-grow'>{highlightText(card.title)}</div>  {/*highlighting the text*/}
                                                  <div>
                                                    <button className='text-green-500 mr-2 flex-end' onClick={() => handleEditCard(card.id, card.title)}><FaEdit /></button>
                                                    <button onClick={() => handleDeleteCard(card.id)} className="text-red-500 flex-end"><FaTrashAlt /></button>
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

export default KanbanBoard;