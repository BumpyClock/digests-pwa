import React, { useEffect, useRef, useCallback, useState } from 'react';
import {SlIconButton, SlTooltip, SlTag, SlButton, SlDetails} from "@shoelace-style/shoelace/dist/react";
import "./PodcastDetails.css";
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar';
import { AnimatePresence , motion} from 'framer-motion';
import PodcastPlayer from '../PodcastPlayer/PodcastPlayer';
import axios from "axios";



const PodcastDetails = ({ url, item, AiFeatures, onClose }) => {
  const modalRef = useRef(null);
  const contentContainerRef = useRef(null);
  const scrollableDescriptionRef = useRef(null);
  const podcastPlayerRef = useRef(null); // Reference to control podcast player
  const [parentHeight, setParentHeight] = useState(0);
  const isPodcastAILoading = useRef(true);
  const requestSent = useRef(true);
  const podcastAIContentref = useRef(null);
const [podcastAIContent, setPodcastAIContent] = useState(null);

  // Disable background scrolling when the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  
  useEffect(() => {
    // Disable background scrolling
    document.body.style.overflow = "hidden";

      const fetchPodcastAIContent = async () => {
      try {
        const apiUrl = "https://whisper.digests.app";
        requestSent.current = false;
        console.log("Fetching article content for: ", url, " from: ", apiUrl);
        const endpoint = `${apiUrl}/transcribe`;
        const response = await axios.post(endpoint, {
          headers: {},
          urls: [url],
        });
        console.log("🚀 ~ fetchPodcastAIContent ~ response:", response.data.results);
    
        if (response.status === 200 && response.data.results[0].status === "completed") {
          console.log("podcast transcript fetched successfully");
          console.log(response.data.results);
    
          const result = response.data.results[0];
    
          setPodcastAIContent({
            ...result,

          });
        } else {
          console.log("Error fetching the podcast AI content:", response);
        }
      } catch (error) {
        console.error("Error fetching the AI content:", error);
      }
      isPodcastAILoading.current = false;
    };

    if (isPodcastAILoading.current && url && requestSent.current) {
      fetchPodcastAIContent();
    }

    return () => {
      document.body.style.overflow = "";
      podcastAIContentref.current = null;
    };
  }, [url, AiFeatures, setPodcastAIContent]);

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

  // Set the height of the parent container
  useEffect(() => {
    if (scrollableDescriptionRef.current) {
      setParentHeight(scrollableDescriptionRef.current.clientHeight);
    }
  }, []);

  // Example method to request playback from a specific timestamp
  const requestPlaybackFromTimestamp = (timestamp) => {
    if (podcastPlayerRef.current) {
      podcastPlayerRef.current.setPlaybackTime(timestamp);
    }
  };

  return (
    <AnimatePresence>
      <div className="podcast-modal-container" ref={modalRef}>
        <div className="podcast-modal-content" ref={contentContainerRef}>
          {/* Header */}
          <div className="podcast-details-header">
            <div className="reader-view-header-button-container">
              <SlIconButton
                name="collapse"
                library="iconoir"
                class="reader-view-header-button"
                onClick={() => window.open(url, '_blank')}
                label="Open Podcast"
              />
              <SlIconButton
                name="xmark"
                library="iconoir"
                class="reader-view-header-button"
                onClick={onClose}
                label="Close"
              />
            </div>
            <div className="podcast-image-header">
              <div className='background-image' style={{ backgroundImage: `url(${item.thumbnail})` }}></div>
              <div className="icon-container">
                {item.feedImage && (
                  <img src={item.feedImage} alt={item.title} />
                )}
              </div>
            </div>
          </div>
          <CustomScrollbar  className="podcast-ai-container" autoHeightMax={parentHeight}>
          <div className='podcast-detail-view-text-content' ref={scrollableDescriptionRef}>
            <div className="podcast-info">
              <h1>{item.title}</h1>
              <p className='date'>{item.author}</p>
              <p className='reader-view-reading-time'>{new Date(item.published).toLocaleDateString()}</p>
            </div>
            {/* Podcast Player */}
            <PodcastPlayer
              ref={podcastPlayerRef}
              src={item.enclosures[0].url}
            />
            
            
                        {/* <motion.div> */}
              {AiFeatures && isPodcastAILoading.current ? (
                <div className="loading-indicator">Loading...</div>
              ) : (
                <div className="podcast-ai-content" ref={podcastAIContentref}>
                  
                    <div className="podcast-ai-content-text">
                      <h2>Podcast AI Summary</h2>
                      <p>{podcastAIContent?.result?.summary?.overall_summary}</p>
                      <h3>Topics</h3>
                      <div className="podcast-ai-content-topics">
                        {(() => {
                          try {
                            return podcastAIContent?.result?.summary?.topics.map((topic, index) => (
                              <div className='topic-container'>
                                <SlDetails summary={topic.title} class="topic" Id={index}>
                                  <p>{topic.content}</p>
                                </SlDetails>
                              
                                </div>
                             
                            ));
                          } catch (error) {
                            console.error("Error rendering topics:", error);
                            return <div className="error-message">Error loading topics.</div>;
                          }
                        })()}
                      </div>
                    </div>
                </div>
               

              )}
            {/* </motion.div> */}

            {/* Podcast Description with Scrollable Area */}
            <div className="scrollable-description" >
              
                <div className="podcast-description-content">
                  <SlDetails summary="Description" class="description-header">

                  <p>{item.description}</p>
                  </SlDetails>
                </div>
            </div>
          </div>
          </CustomScrollbar>
        </div>
      </div>
      
    </AnimatePresence>
  );
};

export default PodcastDetails;
