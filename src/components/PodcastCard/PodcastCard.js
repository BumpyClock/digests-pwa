import React from 'react';
import './PodcastCard.css'; // Assume you have styles defined for your podcast card

const PodcastCard = ({ item }) => {
  return (
    <div className="podcast-card">
      <div className="podcast-image">
        <img src={item.image} alt={item.title} />
      </div>
      <div className="podcast-info">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <button>Play</button>
      </div>
    </div>
  );
};

export default PodcastCard;