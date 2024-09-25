// AppBar.js

import React from 'react';
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./AppBar.css";

const AppBar = ({
  isScrolled,
  refreshFeed,
  isListView,
  setIsListView,
  showSettings,
  toggleSettings,
  filterType,
  setFilterType
}) => {
  return (
    <div className="top-bar">
      <div className="button-container">
        {/* Home Button */}
        <SlIconButton 
          className='icon-button'
          name='home'
          id='homeButton'
          size='large'
          library='iconoir'
          style={{ cursor: 'pointer' }}
          onClick={() => setFilterType('all')} // Set filter to 'all'
        />

        {/* Podcast Button */}
        <SlIconButton
          className="icon-button"
          name="podcast"
          id="podcastButton"
          size="large"
          library="iconoir"
          style={{ cursor: "pointer" }}
          onClick={() => setFilterType('podcast')} // Set filter to 'podcast'
        />

        {/* RSS Feed Button */}
        <SlIconButton
          className="icon-button"
          name="rss-feed"
          id="rssFeedButton"
          size="large"
          library="iconoir"
          style={{ cursor: "pointer" }}
          onClick={() => setFilterType('rss')} // Set filter to 'rss'
        />

        {/* Bookmark Button (Optional) */}
        <SlIconButton
          className="icon-button"
          name="bookmark"
          id="bookmarkButton"
          size="large"
          library="iconoir"
          style={{ cursor: "pointer" }}
          onClick={refreshFeed} // Update as needed
        />

        {/* Refresh Button */}
        <SlIconButton
          className="icon-button"
          name="refresh"
          id="refreshButton"
          size="large"
          library="iconoir"
          style={{ cursor: "pointer" }}
          onClick={refreshFeed}
        />

        {/* Settings Button */}
        <SlIconButton
          className="icon-button"
          name={showSettings ? "xmark" : "settings"}
          size="large"
          library="iconoir"
          id="settingsButton"
          style={{ cursor: "pointer" }}
          onClick={(event) => {
            toggleSettings();
            event.currentTarget.blur();
          }}
        />
      </div>
    </div>
  );
};

export default AppBar;
