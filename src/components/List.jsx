// src/components/List.jsx
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import Card from './Card';

function List({ list, cards }) {
  return (
    <div className="min-w-[300px] bg-pink-400 rounded-md p-4 shadow-md">
      <h3 className="font-semibold mb-2">{list.title}</h3>
      <Droppable droppableId={list.id} type="card">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card card={card} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default List;