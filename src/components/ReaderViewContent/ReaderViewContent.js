import React, { useState, useEffect, useRef } from 'react';
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import WebsiteInfo from "../website-info/website-info.js";
import "./ReaderViewContent.css";

function estimateReadingTime(text) {
  if (!text) return 0;
  const wordsPerMinute = 183; // Adjust this value based on your preferred reading speed
  const words = text.trim().split(/\s+/).length;
  const readingTimeInMinutes = Math.ceil(words / wordsPerMinute);
  return readingTimeInMinutes;
}

const ReaderViewContent = ({ article, url, onClose, item,modalRef }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const pageTextRef = useRef(null); // Using useRef to access the page text element
  console.log("modalRef",modalRef);

  useEffect(() => {
    const handleScrollEvent = () => {
      if (modalRef.current) {
        const position = modalRef.current.scrollPosition; // Use scrollTop of the ref element
        if (scrollPosition !== position) { // Update only if there's a change
          setScrollPosition(position);
        }
      }
    };

    const pageTextElement = modalRef.current;
    if (pageTextElement) {
      pageTextElement.addEventListener('scroll', handleScrollEvent); // Attach the event listener to the ref element
  
      return () => {
        pageTextElement.removeEventListener('scroll', handleScrollEvent); // Cleanup on component unmount
      };
    }
  }, [modalRef,scrollPosition]); // Depend on scrollPosition to ensure updates are based on the latest state

  return (
    <>
      <div className="reader-view-page-content" ref={pageTextRef}>
        <div className="reader-view-header">
          <div className="header-image-info">
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
          <div
            className="header-image"
            style={{
              transform: `scale(${Math.max(1 - scrollPosition / 1000, 0.8)})`,
              filter: `blur(${Math.min(scrollPosition / 100, 5)}px)`,
              height: `${Math.max(500 - scrollPosition, 100)}px`
            }}
          >
            {item.thumbnail && <img src={item.thumbnail} alt="Header" style={{ width: '100%', objectFit: 'cover' }} />}
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
        </div>

        <div className="reader-view-page-text">
          <div
            className="reader-view-article"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </div>
    </>
  );
};

export default ReaderViewContent;