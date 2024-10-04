import React, { useEffect, useRef, useCallback, useState } from 'react';
import { SlIconButton,  SlDetails, SlSkeleton } from "@shoelace-style/shoelace/dist/react";
import "./PodcastDetails.css";
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar';
import { AnimatePresence } from 'framer-motion';
import PodcastPlayer from '../PodcastPlayer/PodcastPlayer';
import axios from "axios";

const PodcastDetailsLoader = () => {
  return (
    <AnimatePresence>
    <div className="podcast-ai-content" style={{padding:`2rem`}}>
      <SlSkeleton effect="pulse" style={{ '--sheen-color':`#ffb094`, width: '100%', height: '2.5rem', marginBottom: '.5rem' }} />
      <SlSkeleton effect="pulse" style={{ width: '80%', height: '1.5rem', marginBottom: '1.5rem' }} />
      <SlSkeleton effect="pulse" style={{ '--sheen-color':`#ffb094`, width: '100%', height: '2.5rem', marginBottom: '.5rem' }} />
      <SlSkeleton effect="pulse" style={{ width: '90%', height: '1.5rem', marginBottom: '0.5rem' }} />
      <SlSkeleton effect="pulse" style={{ width: '70%', height: '1.5rem', marginBottom: '0.5rem' }} />
      <SlSkeleton effect="pulse" style={{ width: '60%', height: '1.5rem', marginBottom: '1rem' }} />
    </div>
    </AnimatePresence>
  );
};

const PodcastDetails = ({ url, item, AiFeatures, onClose }) => {
  const modalRef = useRef(null);
  const contentContainerRef = useRef(null);
  const scrollableDescriptionRef = useRef(null);
  const podcastPlayerRef = useRef(null);
  const [parentHeight, setParentHeight] = useState(0);
  const isPodcastAILoading = useRef(true);
  const requestSent = useRef(true);
  const [podcastAIContent, setPodcastAIContent] = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const fetchPodcastAIContent = async () => {
      try {
        const apiUrl = "https://whisper.digests.app";
        requestSent.current = false;
        const endpoint = `${apiUrl}/transcribe`;
        const response = await axios.post(endpoint, {
          headers: {},
          urls: [url],
        });

        if (response.status === 200 && response.data.results[0].status === "completed") {
          const result = response.data.results[0];
          setPodcastAIContent({ ...result });
          isPodcastAILoading.current = false;
        } else {
          isPodcastAILoading.current = true;
        }
      } catch (error) {
        console.error("Error fetching the AI content:", error);
      }
    };

    if (isPodcastAILoading.current && url && requestSent.current) {
      fetchPodcastAIContent();
    }

    const intervalId = setInterval(() => {
      if (isPodcastAILoading.current) {
        console.log("Fetching podcast AI content...");
        fetchPodcastAIContent();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      document.body.style.overflow = "";
    };
  }, [url]);

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

  useEffect(() => {
    if (scrollableDescriptionRef.current) {
      setParentHeight(scrollableDescriptionRef.current.clientHeight);
    }
  }, []);



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
                className="reader-view-header-button"
                onClick={() => window.open(url, '_blank')}
                label="Open Podcast"
              />
              <SlIconButton
                name="xmark"
                library="iconoir"
                className="reader-view-header-button"
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

          <div className='podcast-detail-view-text-content' ref={scrollableDescriptionRef}>
            <CustomScrollbar className="podcast-ai-container" autoHeightMax={parentHeight} style={{ height: `${parentHeight}px` }}>
              {/* Podcast Description */}
              <div className="podcast-description-content">
                <SlDetails summary="Description" className="description-header">
                  <p>{item.description}</p>
                </SlDetails>
              </div>

              {/* Podcast AI Summary */}
              {isPodcastAILoading.current ? (
                <PodcastDetailsLoader />
              ) : (
                <div className="podcast-ai-content" >
                  <div className="podcast-ai-content-text">
                    <h2>Podcast AI Summary</h2>
                    <p>{podcastAIContent?.result?.summary?.overall_summary}</p>
                    <h3>Topics</h3>
                    <div className="podcast-ai-content-topics">
                      {(() => {
                        try {
                          return podcastAIContent?.result?.summary?.topics.map((topic, index) => (
                            <div className='topic-container' key={index}>
                              <SlDetails summary={topic.title} className="topic" id={index}>
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
            </CustomScrollbar>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default PodcastDetails;
