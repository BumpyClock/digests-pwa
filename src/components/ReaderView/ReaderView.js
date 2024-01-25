import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import WebsiteInfo from "../website-info/website-info.js";
import "./ReaderView.css";

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
  const setCircularProgress = (progressIndicator, progressPercentage) => {
    const radius = progressIndicator.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercentage / 100) * circumference;
    progressIndicator.style.strokeDashoffset = offset;
  };

  setCircularProgress(progressCircle, progressPercentage);
}

const ReaderView = ({ url, item, onClose }) => {
  const [article, setArticle] = useState(null);
  // eslint-disable-next-line
  const progressCircleRef = useRef(null);
  const pageTextRef = useRef(null);
  const articleRef = useRef(null);
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Disable background scrolling
    document.body.style.overflow = "hidden";

    const fetchArticle = async () => {
      try {
        const response = await axios.post(
          `https://api.bumpyclock.com/getreaderview`,
          {
            headers: {
              "Content-Type": "application/json"
            },
            urls: [url]
          }
        );

        if (response.status === 200 && response.data[0].status === "ok") {
          setArticle({
            content: response.data[0].content,
            title: response.data[0].title,
            textContent: response.data[0].textContent
          });
        } else {
          setArticle({ content: "Error getting article content" });
        }
        // console.log("🚀 ~ fetchArticle ~ for", url);
      } catch (error) {
        console.error("Error fetching the page content:", error);
      }
      setIsLoading(false);
    };

    fetchArticle();

    // Cleanup function to re-enable background scrolling
    return () => {
      document.body.style.overflow = "";
    };
  }, [url]); // Effect runs when URL changes

  const handleGlobalScroll = useCallback((event) => {
  if (modalRef.current && articleRef.current) {
    event.preventDefault();
    const { scrollTop, scrollHeight, clientHeight } = articleRef.current;
    const wheel = event.deltaY < 0 ? -1 : 1;
    const newScrollTop = scrollTop + (wheel * 30); // 30 is the scroll speed, adjust as needed

    // Prevent scrolling beyond the content
    if (newScrollTop < 0) {
      articleRef.current.scrollTop = 0;
    } else if (newScrollTop > scrollHeight - clientHeight) {
      articleRef.current.scrollTop = scrollHeight - clientHeight;
    } else {
      articleRef.current.scrollTop = newScrollTop;
    }
  }
}, []);


  const handleScroll = useCallback(() => {
    updateReadingProgress(progressCircleRef.current, articleRef.current);
  }, []);

  useEffect(() => {
  window.addEventListener('wheel', handleGlobalScroll, { passive: false });

  return () => {
    window.removeEventListener('wheel', handleGlobalScroll);
  };
}, [handleGlobalScroll]);

  useEffect(() => {
    const articleElement = articleRef.current;

    if (articleElement) {
      articleElement.addEventListener("scroll", handleScroll);
      return () => {
        articleElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, article]); 

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !articleRef.current.contains(event.target)) {
      onClose();
      document.body.style.overflow = ""; // Re-enable scrolling
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleModalScroll = useCallback((event) => {
    articleRef.current.scrollTop = event.target.scrollTop;
  }, []);

  useEffect(() => {
    const modalElement = modalRef.current;

    if (modalElement) {
      modalElement.addEventListener("scroll", handleModalScroll);
      return () => {
        modalElement.removeEventListener("scroll", handleModalScroll);
      };
    }
  }, [handleModalScroll]);

  return (
    <SlAnimation name="fade-in" duration={500} play={article !== null}>
        <div className="reader-view-modal visible" ref={modalRef}>
          <div className="reader-view-content" ref={articleRef}>
            {isLoading ? (
              <SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />
            ) : (
              article && (
                <>
                  <div className="reader-view-page-content" ref={pageTextRef}>
                    <div className="reader-view-header">
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
  name="xmark"
  class="reader-view-header-button"
  onClick={() => {
    onClose();
    document.body.style.overflow = ""; // Re-enable scrolling
  }}
/>
                       
                      </div>
                      <WebsiteInfo
  favicon={item.favicon}
  siteTitle={item.siteTitle}
  feedTitle={item.feedTitle}
  style={{ marginBottom: '8px' }}
/>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <h1 className="reader-view-title">{article.title}</h1>
                      </a>
                      <p className="reader-view-reading-time">
                        {estimateReadingTime(article.textContent)} minutes
                      </p>
                      <hr className="solid" />
                    </div>
                    <div className="reader-view-page-text">
                      <div
                        className="reader-view-article"
                        dangerouslySetInnerHTML={{ __html: article.content }}
                      />
                    </div>
                  </div>
                  <div
                    id="progress-ring"
                    className="progress-indicator-container"
                  >
                    <svg className="progress-circle" viewBox="0 0 36 36">
                      <circle
                        className="progress-circle__background"
                        cx="18"
                        cy="18"
                        r="15.9155"
                        strokeWidth="2"
                      ></circle>
                      <circle
                        ref={progressCircleRef}
                        className="progress-circle__progress"
                        cx="18"
                        cy="18"
                        r="15.9155"
                        strokeWidth="2"
                        strokeDasharray="100"
                        strokeDashoffset="100"
                      ></circle>
                    </svg>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      
    </SlAnimation>
  );
};

export default ReaderView;
