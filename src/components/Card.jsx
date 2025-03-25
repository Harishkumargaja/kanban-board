// src/components/Card.jsx
import React from 'react';

function Card({ card }) {
  return (
    <div className="bg-white p-2 rounded-md shadow-sm mb-2">
      {card.title}
    </div>
  );
}

export default Card;