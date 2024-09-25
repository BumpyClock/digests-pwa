import React from 'react';
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./AppBar.css";

const AppBar = ({ isScrolled, refreshFeed, isListView, setIsListView, showSettings, toggleSettings }) => {
  return (
    <div className="top-bar">
      <div className="button-container">
      <SlIconButton 
        className='icon-button'
        name='home'
        id='homeButton'
        size='large'
        library='iconoir'
        style={{
            cursor: 'pointer',
           
        }}
        onClick={() => window.location.href = '/'} />

       
         <SlIconButton
          className="icon-button"
          name="podcast"
          id="podcastButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
          }}
          onClick={refreshFeed} // Ensure refreshFeed is defined properly
        />



<SlIconButton
          className="icon-button"
          name="rss-feed"
          id="rssFeedButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
          }}
          onClick={refreshFeed} // Ensure refreshFeed is defined properly
        />

<SlIconButton
          className="icon-button"
          name="bookmark"
          id="bookmarkButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
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
          className="icon-button"
          name="refresh"
          id="refreshButton"
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
          }}
          onClick={refreshFeed} // Ensure refreshFeed is defined properly
        />
        <SlIconButton
        className='icon-button'
          name={showSettings ? "xmark" : "settings"}
          size="large"
          library="iconoir"
          id="settingsButton"
          style={{
            cursor: "pointer",
          }}
          onClick={(event) => {
            toggleSettings(); // Ensure toggleSettings is defined properly
            event.currentTarget.blur();
          }}
        />
      </div>
    </div>
  );
};

export default AppBar;
