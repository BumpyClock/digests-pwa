import React, { useEffect, useRef, useCallback } from 'react';
// import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./PodcastDetails.css";
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar';

const PodcastDetails = ({ url, item, onClose }) => {
  const modalRef = useRef(null);
  const contentContainerRef = useRef(null);

  // Disable background scrolling when the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Handle clicking outside the modal to close
  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !contentContainerRef.current.contains(event.target)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  // Handle Escape key press to close
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="podcast-modal-container" ref={modalRef}>
      <div className="podcast-modal-content" ref={contentContainerRef}>
        {/* Header */}
        <div className="podcast-details-header">
        <div className="podcast-header-buttons">
            <SlIconButton
              name="collapse"
              library="iconoir"
              onClick={() => window.open(url, '_blank')}
              label="Open Podcast"
            />
            <SlIconButton
              name="xmark"
              library="iconoir"
              onClick={onClose}
              label="Close"
            />
          </div>
          <div className="podcast-details-header-info">
            <img src={item.thumbnail} alt={item.title} className="podcast-thumbnail" />
    
         
        </div>
        
</div>
<div className='podcast-detail-view-text-content'>
            <div className="podcast-info">
              <h1>{item.title}</h1>
              <p>{item.author}</p>
              <p>{new Date(item.published).toLocaleDateString()}</p>
            </div>
            {/* Audio Player */}
        <div className="podcast-audio-player">
          <audio controls className="podcast-audio-player">
            <source src={item.enclosures[0].url} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>

        {/* Podcast Description with Scrollable Area */}
        <div className="scrollable-description">
            <h2>Description</h2>
          <CustomScrollbar>
            <div className="podcast-description-content">
              <p>{item.description}</p>
            </div>
          </CustomScrollbar>
        </div>
          </div>

        
      </div>
    </div>
  );
};

export default PodcastDetails;
