import React from 'react';
import { SlIcon } from '@shoelace-style/shoelace/dist/react';
import './PodcastCard.css';

const PodcastCard = ({ item }) => {
  console.log(item);
  return (
    <div className="podcast-card">
      {/* Card Image */}
      <div className="image-container">
        {item.feedImage && (
          <img src={item.feedImage} alt={item.title} className="podcast-card-image" />
        )}
      </div>

      {/* Card Content */}
      <div className="text-content">
        {/* Title */}
        <h3 className="podcast-title">{item.title}</h3>

        {/* Description */}
        <p className="description">{item.description}</p>

        {/* Podcast Audio Player */}
        <audio controls className="podcast-audio-player">
          <source src={item.enclosures[0].url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>

        {/* External Link */}
        {item.externalLink && (
          <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
            <SlIcon name="external-link" /> Listen on {item.source}
          </a>
        )}
      </div>

      {/* Footer Date and Icon */}
      <div className="card-footer">
        <span className="date">{item.date}</span>
        <span className="icon">
          <SlIcon name="play-circle" />
        </span>
      </div>
    </div>
  );
};

export default PodcastCard;
