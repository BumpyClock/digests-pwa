import React, { useState, useEffect, useRef } from "react";
import {
  SlButton,
  SlInput,
  SlIcon,
} from "@shoelace-style/shoelace/dist/react/";
import "./settings.css";

function Settings({
  feedUrls,
  setFeedUrls,
  feedDetails,
  refreshInterval,
  setRefreshInterval,
}) {
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const inputRef = useRef();

useEffect(() => {
  if (inputRef.current) {
    inputRef.current.addEventListener("input", (e) =>
      setNewFeedUrl(e.target.value)
    );
  }
}, []);

  const isValidUrl = (url) => {
    const pattern = new RegExp('^(https?:\\/\\/)', 'i'); 
    return pattern.test(url);
  };

 const handleAddFeed = () => {
  // Split the newFeedUrl by comma or semicolon
  const urls = newFeedUrl.split(/[,;]/).map(url => url.trim());

  // Validate each URL
  for (const url of urls) {
    if (!url || !isValidUrl(url)) {
      setUrlError(`Invalid URL: ${url}. It must start with http:// or https://`);
      return;
    }
  }

  // If all URLs are valid, add them to the feedUrls
  setFeedUrls([...feedUrls, ...urls]);
  setNewFeedUrl("");
  setUrlError("");
};

  

  const handleRemoveFeed = (url) => {
    setFeedUrls(feedUrls.filter((feedUrl) => feedUrl !== url));
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <div className="subscription-form">
        <SlInput
          ref={inputRef}
          type="text"
          value={newFeedUrl}
          placeholder="http://feed.url/rss.xml"
          clearable
        >
          <SlIcon library="iconoir" name="rss-feed" slot="prefix"></SlIcon>
        </SlInput>
        <SlButton onClick={handleAddFeed}>Add Feed</SlButton>
      </div>
      {urlError && <p className="error-message">{urlError}</p>}
      <div id="subscribed-feeds-list">
        {feedDetails.map((detail, index) => (
          <div key={feedUrls[index]} className="list-item">
            <div className="website-info">
              <img
                className="site-favicon"
                src={detail.favicon}
                alt={`${detail.siteTitle || detail.feedTitle} Favicon`}
              />
              <h3>{ detail.feedTitle || detail.siteTitle }</h3>
              <p className="feed-url">{detail.feedUrl}</p>
            </div>
            <button
              className="remove-feed-button"
              onClick={() => handleRemoveFeed(feedUrls[index])}
            >
              <p className="unsubscribe-button">Unsubscribe</p>
            </button>
          </div>
        ))}
      </div>
      <div className="settings-section">
        <div className="infoContainer">
          <h3>Refresh Interval</h3>
          <p>How often should Digests check for new items?</p>
        </div>
        <SlInput
          type="number"
          label="Refresh Interval (minutes):"
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Settings;
