import React from 'react';
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

  const ReaderViewContent = ({ article, url, onClose, item, progressCircleRef, pageTextRef }) => {
    return (
      <>
        <div className="reader-view-page-content" ref={pageTextRef}>
          <div className="reader-view-header">
            <img src={item.thumbnail} alt="favicon" className="reader-view-header-image" />
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
  }}
              />
            </div>
            <WebsiteInfo
              favicon={item.favicon}
              siteTitle={item.siteTitle}
              feedTitle={item.feedTitle}
              style={{ marginBottom: '8px', maxWidth: 'fit-content'}}
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
        {/* <div
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
        </div> */}
      </>
    );
  };

  export default ReaderViewContent;