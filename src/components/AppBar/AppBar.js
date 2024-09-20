import React from 'react';
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./AppBar.css";

const AppBar = ({ isScrolled, refreshFeed, isListView, setIsListView, showSettings, toggleSettings }) => {
  return (
    <header className="top-bar">
      <div className="button-container">
      <SlIconButton 
        className='refresh'
        name='home'
        id='homeButton'
        size='large'
        library='iconoir'
        style={{
            cursor: 'pointer',
            fontSize: isScrolled ? '1.5rem' : '1.5rem'
        }}
        onClick={() => window.location.href = '/'} />

       
         <SlIconButton
          className="refresh"
          name="podcast"
          id="podcastButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
            fontSize: isScrolled ? "1.5rem" : "1.5rem"
          }}
          onClick={refreshFeed} // Ensure refreshFeed is defined properly
        />



<SlIconButton
          className="refresh"
          name="rss-feed"
          id="podcastButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
            fontSize: isScrolled ? "1.5rem" : "1.5rem"
          }}
          onClick={refreshFeed} // Ensure refreshFeed is defined properly
        />

<SlIconButton
          className="refresh"
          name="bookmark"
          id="rssButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
            fontSize: isScrolled ? "1.5rem" : "1.5rem"
          }}
          onClick={refreshFeed} // Ensure refreshFeed is defined properly
        />
       


        {/* <SlIconButton
          className="view-toggle"
          name={isListView ? "view-grid" : "list"}
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
            fontSize: isScrolled ? "1.5rem" : "1.5rem"
          }}
          onClick={() => setIsListView(prev => !prev)} // Ensure setIsListView is defined properly
        /> */}
         <SlIconButton
          className="refresh"
          name="refresh"
          id="refreshButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
            fontSize: isScrolled ? "1.5rem" : "1.5rem"
          }}
          onClick={refreshFeed} // Ensure refreshFeed is defined properly
        />
        <SlIconButton
          name={showSettings ? "xmark" : "settings"}
          size="large"
          library="iconoir"
          id="settingsButton"
          style={{
            cursor: "pointer",
            fontSize: isScrolled ? "1.5rem" : "1.5rem"
          }}
          onClick={(event) => {
            toggleSettings(); // Ensure toggleSettings is defined properly
            event.currentTarget.blur();
          }}
        />
      </div>
    </header>
  );
};

export default AppBar;
