import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import axios from "axios";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./ReaderView.css";
import WebsiteInfo from "../website-info/website-info.js";

function estimateReadingTime(text) {
  if (!text) return 0;
  const wordsPerMinute = 183; // Adjust this value based on your preferred reading speed
  const words = text.trim().split(/\s+/).length;
  const readingTimeInMinutes = Math.ceil(words / wordsPerMinute);
  return readingTimeInMinutes;
}

const ReaderView = ({ url, item, onClose }) => {
  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const modalRef = useRef(null);
  const articleRef = useRef(null);
  const contentcontainerRef = useRef(null);

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
      } catch (error) {
        console.error("Error fetching the page content:", error);
      }
      setIsLoading(false);
    };

    fetchArticle();

    return () => {
      document.body.style.overflow = "";
    };
  }, [url]);

  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const position = articleRef.current.scrollTop;
        if (scrollPosition !== position) {
          setScrollPosition(position);
        }
      }
    };

    const modalElement = articleRef.current;
    if (modalElement) {
      modalElement.addEventListener("scroll", handleScroll);
      return () => {
        modalElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [scrollPosition]);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !contentcontainerRef.current.contains(event.target)) {
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        document.body.style.overflow = ""; // Re-enable scrolling
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className={`modal-container ${isLoading ? '' : 'visible'}`} ref={modalRef}>
      <div className="modal-container-content" ref={contentcontainerRef}>
        <Suspense fallback={<SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />}>
          {isLoading ? (
            <SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />
          ) : (
            article && (
              <>
                <div className="reader-view-page-content" >
                <div className="reader-view-header-container">

                  <div className="reader-view-header">
                    <div
                      className="header-image"
                      style={{
filter: `blur(${Math.min(Math.pow(scrollPosition / 25, 1.5), 150)}px) opacity(${Math.max(1 - Math.pow(scrollPosition / 100, 2), 0.6)})`,         
height: `${Math.max(500 - Math.pow(scrollPosition / 100, 1.5) * 50, 150)}px`                      }}
                    >
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt="Header"
                          style={{ width: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </div>
                    <div className="header-image-info" style={{ transform: `translateY(${Math.max(-scrollPosition , -40)}px)` }}>
                      <WebsiteInfo
                        favicon={item.favicon}
                        siteTitle={item.siteTitle}
                        feedTitle={item.feedTitle}
                        style={{ marginBottom: '8px', maxWidth: 'fit-content' }}
                      />
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <h1 className="reader-view-title">{article.title}</h1>
                      </a>
                      <p className="reader-view-reading-time">
                        {estimateReadingTime(article.textContent)} minutes
                      </p>
                    </div>
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
                        onClick={onClose}
                      />
                    </div>
                  </div></div>
                  <div className="reader-view-page-text" ref={articleRef}>
                    <div
                      className="reader-view-article"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                </div>
              </>
            )
          )}
        </Suspense>
      </div>
    </div>
  );
};

export default ReaderView;