/**
 * @file ReaderView.js
 * @description Full code for a ReaderView component that:
 *  1) Fetches article content from your API (apiUrl + /getreaderview).
 *  2) Displays a header image or YouTube embed if the link is a YouTube video.
 *  3) Provides text-to-speech functionality and optional AI summarization (with an OpenAI key).
 *  4) Handles reading time estimation, scrolling transitions, and graceful fallback states.
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SlSpinner from '@shoelace-style/shoelace/dist/react/spinner';
import SlCard from '@shoelace-style/shoelace/dist/react/card';
import SlIconButton from '@shoelace-style/shoelace/dist/react/icon-button';
import ReactMarkdown from 'react-markdown';
import './ReaderView.css';
import WebsiteInfo from '../website-info/website-info.js';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar.js';
import TextToSpeechPlayer from '../TextToSpeechPlayer/TextToSpeechPlayer.js';

/**
 * @function estimateReadingTime
 * @description Estimate reading time for plain text.
 * @param {string} text - The text to estimate reading time for.
 * @returns {number} - Approximate reading time in minutes.
 */
function estimateReadingTime(text) {
  if (!text) return 0;
  const wordsPerMinute = 183; // Average adult reading speed
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * @function ReaderView
 * @description A full-screen modal-like component displaying article content (or YouTube).
 * @param {object} props - The component props.
 * @param {string} props.url - The URL of the article to display.
 * @param {object} props.item - The article item object.
 * @param {string} props.apiUrl - The base URL for API requests.
 * @param {string} props.openAIKey - The OpenAI API key.
 * @param {function} props.onRequestClose - Function to close the ReaderView.
 * @returns {JSX.Element} - The rendered component.
 */
const ReaderView = ({ url, item, apiUrl, openAIKey, onRequestClose }) => {
  const [article, setArticle] = useState(null);
  const isLoading = useRef(true);
  const requestSent = useRef(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const modalRef = useRef(null);
  const articleRef = useRef(null); // For scrolling in the article section
  const contentcontainerRef = useRef(null);
  const scrollPositionRef = useRef(scrollPosition);
  const headerImageInfoRef = useRef(null); // For dynamic positioning of the header text
  const viewportWidth = window.innerWidth;
  const [showTextToSpeech, setShowTextToSpeech] = useState(false);
  const dynamicTop = useRef(0);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(null);
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);

  // Summarization states
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState(null);

  // For progressive image loading
  const [imageSrc, setImageSrc] = useState(null);

  /**
   * @function isGifOrMp4
   * @description Check if the given URL is a GIF or MP4 file.
   * @param {string} url - The URL to check.
   * @returns {boolean} - True if the URL is a GIF or MP4, false otherwise.
   */
  const isGifOrMp4 = (url) => {
    const extension = url.split('.').pop().toLowerCase();
    return extension === 'gif' || extension === 'mp4';
  };

  /**
   * Build the low-res thumbnail URL (if needed).
   */
  const lowResThumbnailUrl = useMemo(() => {
    if (item.thumbnail && !isGifOrMp4(item.thumbnail)) {
      // Example of a resizing or proxy endpoint:
      return `https://www.digests.app/cdn-cgi/image/fit=scale-down,width=450,format=auto/${item.thumbnail}`;
    }
    return item.thumbnail;
  }, [item.thumbnail]);

  /**
   * Build the high-res thumbnail URL (if needed).
   */
  const highResThumbnailUrl = useMemo(() => {
    if (item.thumbnail && !isGifOrMp4(item.thumbnail)) {
      // You could use a larger width if you prefer
      return item.thumbnail;
    }
    return item.thumbnail;
  }, [item.thumbnail]);

  /**
   * useEffect to handle progressive loading of thumbnail images.
   * 1) Set a low-res image as `imageSrc`.
   * 2) Preload the high-res image in background.
   * 3) Switch to high-res after loading finishes.
   */
  useEffect(() => {
    // Initially set the low resolution image
    setImageSrc(lowResThumbnailUrl);

    // Load the high resolution image
    const img = new Image();
    img.src = highResThumbnailUrl;
    img.onload = () => {
      setImageSrc(highResThumbnailUrl);
    };
  }, [lowResThumbnailUrl, highResThumbnailUrl]);

  /**
   * If the link is YouTube, parse out the video ID and build an embed URL.
   */
  useEffect(() => {
    if (item.link && item.link.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(item.link).search);
      const videoId = urlParams.get('v');
      if (videoId) {
        setYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
        setIsYoutubeVideo(true);
      }
    }
  }, [item.link]);

  /**
   * Dynamically calculate a "header" height based on scroll to create a parallax-like effect.
   */
  function calculateHeaderHeight(scrollPos) {
    // For example, min 200px, max 500px
    return Math.max(500 - Math.pow(scrollPos / 100, 1.5) * 50, 200);
  }

  /**
   * Dynamically calculate how far up or down to place text over an image as user scrolls.
   */
  function calculateHeaderImageInfoBottom(scrollPos) {
    const maxScroll = 500;
    const minBottom = -1; // how far down (in em) when user scrolls far
    let maxBottom;
    if (viewportWidth < 600) {
      maxBottom = 1.5;
    } else if (viewportWidth >= 600 && viewportWidth < 1200) {
      maxBottom = 1;
    } else {
      maxBottom = 0.5;
    }
    const scaleFactor = Math.max(0, Math.min(1, scrollPos / maxScroll));
    const bottom = minBottom + scaleFactor * (maxBottom - minBottom);
    return `${bottom}em`;
  }

  /**
   * If user clicks outside the modal, close the ReaderView.
   */
  const handleClickOutside = useCallback(
    (event) => {
      if (
        modalRef.current &&
        !contentcontainerRef.current.contains(event.target)
      ) {
        onRequestClose();
        document.body.style.overflow = '';
        articleRef.current = null;
      }
    },
    [onRequestClose]
  );

  /**
   * Fetch article content from your server when not dealing with a YouTube video.
   * This calls (apiUrl)/getreaderview, expecting an array of { status, content, title, textContent }.
   */
  useEffect(() => {
    if (!isYoutubeVideo) {
      document.body.style.overflow = 'hidden';

      const fetchArticle = async () => {
        try {
          requestSent.current = false;
          const endpoint = `${apiUrl}/getreaderview`;
          const response = await axios.post(endpoint, {
            headers: {},
            urls: [url],
          });

          if (response.status === 200 && response.data[0].status === 'ok') {
            setArticle({
              content: response.data[0].content,
              title: response.data[0].title,
              textContent: response.data[0].textContent,
            });
          } else {
            setArticle({
              content: 'Error getting article content',
              title: item.title || 'Error', // Fallback to item.title or 'Error'
              textContent: '',
            });
          }
        } catch (error) {
          console.error('Error fetching the page content:', error);
          setArticle({
            content: 'Error fetching article content',
            title: item.title || 'Error', // Fallback to item.title or 'Error'
            textContent: '',
          });
        }
        isLoading.current = false;
      };

      if (isLoading.current && url && requestSent.current) {
        fetchArticle();
      }

      return () => {
        document.body.style.overflow = '';
        articleRef.current = null;
      };
    }
  }, [url, apiUrl, isYoutubeVideo, item.title]);

  /**
   * Listen to scroll events in the article content to do parallax or dynamic transitions.
   */
  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const position = articleRef.current.scrollTop;
        if (scrollPositionRef.current !== position) {
          if (headerImageInfoRef.current) {
            dynamicTop.current = Math.max(
              calculateHeaderHeight(position) -
                headerImageInfoRef.current.offsetHeight,
              24
            );
          }
          setScrollPosition(position);
          scrollPositionRef.current = position;
        }
      }
    };

    const articleElement = articleRef.current;
    if (articleElement) {
      articleElement.addEventListener('scroll', handleScroll);
      return () => {
        articleElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  /**
   * Close on outside-click (mousedown) or ESC key.
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onRequestClose();
        document.body.style.overflow = '';
        articleRef.current = null;
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onRequestClose]);

  // Framer-motion variants
  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const readerViewVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  /**
   * Summarize the article using GPT-style API calls, if openAIKey is present.
   */
  const handleSummarize = useCallback(
    async () => {
      if (!article || !article.textContent) {
        setSummarizeError('No article content to summarize.');
        return;
      }

      const wordCount = article.textContent.trim().split(/\s+/).length;
      if (wordCount < 500) {
        setSummary(
          "Article is too short to summarize. Don't be lazy, just read it."
        );
        return;
      }

      setIsSummarizing(true);
      setSummarizeError(null);
      setSummary(''); // clear any previous summary

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'You are a helpful assistant that can summarize long articles to highlight key points.',
              },
              {
                role: 'user',
                content: article.textContent,
              },
            ],
            temperature: 0.7, // Adjust for creativity
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openAIKey}`,
            },
          }
        );

        if (response.status === 200) {
          const summaryText = response.data.choices[0].message.content.trim();
          setSummary(summaryText);
        } else {
          console.error('Error summarizing the article:', response);
          setSummarizeError('Error summarizing the article. Try again.');
        }
      } catch (error) {
        console.error('Error summarizing the article:', error);
        setSummarizeError('An error occurred while summarizing the article.');
      }

      setIsSummarizing(false);
    },
    [article, openAIKey]
  );

  return (
    <AnimatePresence>
      <div className="reader-view-overlay"></div>
      <motion.div
        className="modal-container visible"
        ref={modalRef}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        transition={{ duration: 0.125, ease: 'easeInOut' }}
      >
        <SlCard
          className="reader-card"
          layoutd={`card-${item.id}`}
          variants={modalVariants}
          ref={contentcontainerRef}
          transition={{ duration: 0.125, ease: 'easeInOut' }}
        >
          {/* Top-right action buttons */}
          <div className="reader-view-header-button-container">
            <SlIconButton
              library="iconoir"
              name="open-new-window"
              class="reader-view-header-button"
              onClick={() => window.open(url, '_blank')}
              title="Open this article in a new tab"
            />

            <SlIconButton
              library="iconoir"
              name="headset-bolt"
              class="reader-view-header-button"
              onClick={() => setShowTextToSpeech(!showTextToSpeech)}
              title="Toggle Text-to-Speech"
            />

            {openAIKey && (
              <SlIconButton
                library="iconoir"
                name="sparks"
                class="reader-view-header-button"
                onClick={handleSummarize}
                disabled={isSummarizing}
                title="Summarize Article"
              />
            )}

            <SlIconButton
              library="iconoir"
              name="xmark"
              class="reader-view-header-button"
              onClick={onRequestClose}
              title="Close Reader View"
            />
          </div>

          {/* Main content container */}
          <div className="modal-container-content" style={{ height: '100%' }}>
            <CustomScrollbar autoHeightMax="95vh" style={{ height: '100%' }}>
              {youtubeEmbedUrl ? (
                // Show if it’s a YouTube video
                <div className="youtube-video-container">
                  <iframe
                    width="100%"
                    height="-webkit-fill-available"
                    src={youtubeEmbedUrl}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                // Otherwise, show top image (progressive load)
                <div
                  exit="exit"
                  transition={{ duration: 0.125, ease: 'easeInOut' }}
                  layoutId={`image-${item.id}`}
                >
                  <div className="image-container">
                    <img
                      src={imageSrc}
                      alt={item.siteTitle}
                      style={{ width: '100%', height: '100%' }}
                    />
                  </div>
                </div>
              )}

              {isYoutubeVideo ? null : isLoading.current ? (
                <div className="loading-spinner">
                  <SlSpinner style={{ fontSize: '3rem', margin: 'auto' }} />
                </div>
              ) : article ? (
                <motion.div
                  className="reader-view-motion-wrapper"
                  variants={readerViewVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="reader-view-page-content">
                    <div
                      className="title"
                      ref={headerImageInfoRef}
                      style={{
                        bottom: calculateHeaderImageInfoBottom(scrollPosition),
                      }}
                    >
                      <div className="reader-view-title">
                        <h1>{article.title || url}</h1>
                      </div>
                      {/* ... existing JSX ... */}
                      <WebsiteInfo
                        favicon={item.favicon}
                        siteTitle={item.siteTitle}
                        feedTitle={item.feedTitle}
                        style={{
                          marginBottom: '8px',
                          maxWidth: 'fit-content',
                        }}
                      />

                      <div className="reader-view-website-info">
                        {/* Optional: author or other metadata */}
                        <p className="reader-view-reading-time">{item.author}</p>
                        {/* If we have text, estimate reading time */}
                        {article.textContent && (
                          <p className="reader-view-reading-time">
                            {estimateReadingTime(article.textContent)}{' '}
                            minute read
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Text-to-Speech Player */}
                    {showTextToSpeech && article && (
                      <TextToSpeechPlayer
                        articleText={article.textContent || ''}
                        apiUrl={apiUrl}
                        articleUrl={url}
                      />
                    )}

                    {/* If we have an AI summary */}
                    {summary && (
                      <div className="article-summary">
                        <div className="summary-header">
                          <h3>AI generated summary</h3>
                          <caption>
                            Generated by GPT-4o-mini; may contain inaccuracies.
                          </caption>
                        </div>
                        <ReactMarkdown>{summary}</ReactMarkdown>
                      </div>
                    )}

                    {/* Show any summarization errors */}
                    {summarizeError && (
                      <div className="summary-error">
                        <p>{summarizeError}</p>
                      </div>
                    )}

                    {/* Show a loader if summarizing in progress */}
                    {isSummarizing && (
                      <div className="summarize-loading">
                        <SlSpinner style={{ fontSize: '2rem' }} />
                        <p>Summarizing...</p>
                      </div>
                    )}

                    {/* The main article HTML (sanitized server-side) */}
                    <div className="reader-view-page-text" ref={articleRef}>
                      <div
                        className="reader-view-article"
                        dangerouslySetInnerHTML={{
                          __html: article.content,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="reader-view-error">
                  <p>
                    Error: Unable to load article. Please check the URL and
                    try again.
                  </p>
                </div>
              )}
            </CustomScrollbar>
          </div>
        </SlCard>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReaderView;