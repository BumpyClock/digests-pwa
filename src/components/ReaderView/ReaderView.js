import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import SlIconButton from '@shoelace-style/shoelace/dist/react/icon-button';
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";

import './ReaderView.css';

function estimateReadingTime(text) {
  const wordsPerMinute = 183; // Adjust this value based on your preferred reading speed
  const words = text.trim().split(/\s+/).length;
  const readingTimeInMinutes = Math.ceil(words / wordsPerMinute);

  return readingTimeInMinutes;
}

function updateReadingProgress(progressCircle, pageText) {
  const scrollPosition = pageText.scrollTop;
  const maxScroll = pageText.scrollHeight - pageText.clientHeight;
  const progressPercentage = (scrollPosition / maxScroll) * 100;

  console.log("Scroll progress:", progressPercentage); // Debugging

  const setCircularProgress = (progressIndicator, progressPercentage) => {
    const radius = progressIndicator.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercentage / 100) * circumference;
    progressIndicator.style.strokeDashoffset = offset;
  };

  setCircularProgress(progressCircle, progressPercentage);
}


const ReaderView = ({ url, onClose }) => {
      const [article, setArticle] = useState(null);
       // eslint-disable-next-line
  const [isVisible, setIsVisible] = useState(true);
  const progressCircleRef = useRef(null);
  const pageTextRef = useRef(null);
  const articleRef = useRef(null);
  const modalRef = useRef(null);
 

  useEffect(() => {
    // Disable background scrolling
    document.body.style.overflow = 'hidden';
  
    const fetchArticle = async () => {
      try {
        const response = await axios.post(`https://rss.bumpyclock.com/getreaderview`, {
          headers: {
            "Content-Type": "application/json"
          },
          urls: [url]
        });
  
        if (response.status === 200 && response.data[0].status === "ok") {
          setArticle({
            content: response.data[0].content,
            title: response.data[0].title,
            textContent: response.data[0].textContent
          });
        } else {
          setArticle({ content: "Error getting article content" });
        }
        console.log("🚀 ~ fetchArticle ~ for", url);
      } catch (error) {

        console.error('Error fetching the page content:', error);
      }
    };
  
    fetchArticle();
  
    // Cleanup function to re-enable background scrolling
    return () => {
      document.body.style.overflow = '';
    };
  }, [url]); // Effect runs when URL changes
  

  useEffect(() => {
    const handleScroll = () => {
      updateReadingProgress(progressCircleRef.current, articleRef.current);
    };
  
    const articleElement = articleRef.current;
    // console.log('Setting up scroll event listener', articleElement);
  
    if (articleElement) {
      articleElement.addEventListener('scroll', handleScroll);
      return () => {
        // console.log('Removing scroll event listener');
        articleElement.removeEventListener('scroll', handleScroll);
      };
    }
  }, [article]); // Dependency on article

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !articleRef.current.contains(event.target)) {
        onClose();
        document.body.style.overflow = ''; // Re-enable scrolling
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  

  return (
    <SlAnimation name="fade-in" duration={500} play={article !== null}>
      {isVisible && (
        <div className="reader-view-modal visible" ref={modalRef}>
                    {article && (
            <div className="reader-view-content" ref={articleRef}>
              <div className="reader-view-page-content" ref={pageTextRef}>
                <div className="reader-view-header">
                <SlIconButton name="x" class="reader-view-close" onClick={() => {
  onClose();
  document.body.style.overflow = ''; // Re-enable scrolling
}}></SlIconButton>
<a href={url} target="_blank" rel="noopener noreferrer">
  <h1 className="reader-view-title">{article.title}</h1>
</a>                  <p className="reader-view-reading-time">{estimateReadingTime(article.textContent)} minutes</p>
                  <hr className="solid" />
                </div>
                <div className="reader-view-page-text">
                <div className="reader-view-article"  dangerouslySetInnerHTML={{ __html: article.content }} />                </div>
              </div>
              <div id="progress-ring" className="progress-indicator-container">
                <svg className="progress-circle" viewBox="0 0 36 36">
                  <circle className="progress-circle__background" cx="18" cy="18" r="15.9155" strokeWidth="2"></circle>
                  <circle ref={progressCircleRef} className="progress-circle__progress" cx="18" cy="18" r="15.9155" strokeWidth="2" strokeDasharray="100" strokeDashoffset="100"></circle>
                </svg>
              </div>
            </div>
          )}
        </div>
      )}
    </SlAnimation>
  );
};

export default ReaderView;