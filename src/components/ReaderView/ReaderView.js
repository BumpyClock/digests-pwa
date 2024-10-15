// ReaderView.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
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

function estimateReadingTime(text) {
  if (!text) return 0;
  const wordsPerMinute = 183;
  const words = text.trim().split(/\s+/).length;
  const readingTimeInMinutes = Math.ceil(words / wordsPerMinute);
  return readingTimeInMinutes;
}

const ReaderView = ({ url, item, apiUrl, openAIKey, onClose }) => {
  const [article, setArticle] = useState(null);
  const isLoading = useRef(true);
  const requestSent = useRef(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const modalRef = useRef(null);
  const articleRef = useRef(null);
  const contentcontainerRef = useRef(null);
  const scrollPositionRef = useRef(scrollPosition);
  const headerImageInfoRef = useRef(null);
  const viewportWidth = window.innerWidth;
  const [showTextToSpeech, setShowTextToSpeech] = useState(false);
  const dynamicTop = useRef(0);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState(null);
  const [isYoutubeVideo, setIsYoutubeVideo] = useState(false);

  // State variables for summarization
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizeError, setSummarizeError] = useState(null);

  useEffect(() => {
    // Check if item link is a YouTube video URL
    if (item.link && item.link.includes('youtube.com/watch')) {
      const urlParams = new URLSearchParams(new URL(item.link).search);
      const videoId = urlParams.get('v');
      if (videoId) {
        setYoutubeEmbedUrl(`https://www.youtube.com/embed/${videoId}`);
        setIsYoutubeVideo(true);
      }
    }
  }, [item.link]);

  function calculateHeaderHeight(scrollPosition) {
    return Math.max(500 - Math.pow(scrollPosition / 100, 1.5) * 50, 200);
  }

  function calculateHeaderImageInfoBottom(scrollPosition) {
    const maxScroll = 500;
    const minBottom = -1;
    let maxBottom;
    if (viewportWidth < 600) {
      maxBottom = 1.5;
    } else if (viewportWidth >= 600 && viewportWidth < 1200) {
      maxBottom = 1;
    } else {
      maxBottom = 0.5;
    }
    const scaleFactor = Math.max(0, Math.min(1, scrollPosition / maxScroll));
    const bottom = minBottom + scaleFactor * (maxBottom - minBottom);
    return `${bottom}em`;
  }

  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !contentcontainerRef.current.contains(event.target)) {
        onClose();
        document.body.style.overflow = '';
        articleRef.current = null;
      }
    },
    [onClose]
  );

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
            setArticle({ content: 'Error getting article content' });
          }
        } catch (error) {
          console.error('Error fetching the page content:', error);
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
  }, [url, apiUrl, isYoutubeVideo]);

  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const position = articleRef.current.scrollTop;
        if (scrollPositionRef.current !== position) {
          if (headerImageInfoRef.current) {
            dynamicTop.current = Math.max(
              calculateHeaderHeight(position) - headerImageInfoRef.current.offsetHeight,
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

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        document.body.style.overflow = '';
        articleRef.current = null;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Animation variants
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

  // Handler to summarize the article
  const handleSummarize = useCallback(async () => {
    if (!article || !article.textContent) {
      setSummarizeError('No article content to summarize.');
      return;
    }
  
    const wordCount = article.textContent.trim().split(/\s+/).length;
    if (wordCount < 500) {
      setSummary("Article is too short to summarize. Don't be lazy, just read it.");
      return;
    }
  
    setIsSummarizing(true);
    setSummarizeError(null);
    setSummary(''); // Reset previous summary
  
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant, that can summarize long articles to highlight key points and themes.',
            },
            {
              role: 'user',
              content: `${article.textContent}`,
            },
          ],
          temperature: 0.7, // Adjust creativity level
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAIKey}`,
          },
        }
      );
  
      if (response.status === 200) {
        const summaryText = response.data.choices[0].message.content.trim();
        setSummary(summaryText);
      } else {
        console.error('Error summarizing the article:', response);
      }
    } catch (error) {
      console.error('Error summarizing the article:', error);
      setSummarizeError('An error occurred while summarizing the article.');
    }
  
    setIsSummarizing(false);
  }, [article, openAIKey]);

  return (
    <AnimatePresence>
      <div className="reader-view-overlay"></div>
      <motion.div
        className={`modal-container visible`}
        ref={modalRef}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={modalVariants}
        transition={{ duration: 0.125, ease: 'easeInOut' }}
      >
        <SlCard
          className="reader-card"
          layoutId={`card-${item.id}`}
          variants={modalVariants}
          ref={contentcontainerRef}
          transition={{ duration: 0.125, ease: 'easeInOut' }}
        >
          <div className="reader-view-header-button-container">
            <SlIconButton
              library="iconoir"
              name="open-new-window"
              class="reader-view-header-button"
              onClick={() => {
                window.open(url, '_blank');
              }}
            />
            <SlIconButton
              library="iconoir"
              name="headset-bolt"
              class="reader-view-header-button"
              onClick={() => setShowTextToSpeech(!showTextToSpeech)}
            />
            {openAIKey && (
              <SlIconButton
                library="iconoir"
                name="sparks"
                class="reader-view-header-button"
                onClick={handleSummarize} // Connect to handleSummarize
                disabled={isSummarizing} // Disable button while summarizing
                aria-label="Summarize Article"
              />
            )}
            <SlIconButton
              library="iconoir"
              name="xmark"
              class="reader-view-header-button"
              onClick={onClose}
              aria-label="Close Reader View"
            />
          </div>

          <div className="modal-container-content" style={{ height: '100%' }}>
            <CustomScrollbar autoHeightMax={'95vh'} style={{ height: '100%' }}>
              {youtubeEmbedUrl ? (
                <div className="youtube-video-container">
                  <iframe
                    width="100%"
                    height="-webkit-fill-available"
                    src={youtubeEmbedUrl}
                    title="YouTube video player"
                    alt="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div exit="exit" transition={{ duration: 0.125, ease: 'easeInOut' }} layoutId={`image-${item.id}`}>
                  <div className="image-container">
                    <img src={item.thumbnail} alt={item.siteTitle} style={{ width: '100%', height: '100%' }} />
                  </div>
                </div>
              )}

              {isYoutubeVideo ? null : (
                isLoading.current ? (
                  <div className="loading-spinner">
                    <SlSpinner style={{ fontSize: '3rem', margin: 'auto' }} />
                  </div>
                ) : (
                  article && (
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
                          style={{ bottom: calculateHeaderImageInfoBottom(scrollPosition) }}
                        >
                          <div className="reader-view-title">
                            <h1>{article.title}</h1>
                          </div>
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
                            <p className="reader-view-reading-time">{item.author}</p>
                            <p className="reader-view-reading-time">{estimateReadingTime(article.textContent)} minute read</p>
                          </div>
                        </div>

                        {showTextToSpeech && article && (
                          <TextToSpeechPlayer articleText={article.textContent} apiUrl={apiUrl} articleUrl={url} />
                        )}

                        {/* Display Summary */}
                        {summary && (
                          <div className="article-summary">
                            <div className="summary-header">
                            <h3>AI generated summary</h3>
                            <caption>Generated by GPT-4o-mini, may contain inaccuracies</caption>
                            </div>
                            <ReactMarkdown>{summary}</ReactMarkdown>
                          </div>
                        )}

                        {/* Display Summarization Errors */}
                        {summarizeError && (
                          <div className="summary-error">
                            <p>{summarizeError}</p>
                          </div>
                        )}

                        {/* Summarization Loading Indicator */}
                        {isSummarizing && (
                          <div className="summarize-loading">
                            <SlSpinner style={{ fontSize: '2rem' }} />
                            <p>Summarizing...</p>
                          </div>
                        )}

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
                  )
                )
              )}
            </CustomScrollbar>
          </div>
        </SlCard>
      </motion.div>
    </AnimatePresence>
  );
};

// Exporting the component
export default ReaderView;