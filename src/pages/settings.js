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
      inputRef.current.addEventListener("sl-change", (e) =>
        setNewFeedUrl(e.target.value)
      );
    }
  }, []);

  const isValidUrl = (url) => {
    const pattern = new RegExp('^(https?:\\/\\/)', 'i'); // Check if starts with http:// or https://
    return pattern.test(url);
  };

  const handleAddFeed = () => {
    if (!newFeedUrl || !isValidUrl(newFeedUrl)) {
      setUrlError("Invalid URL. It must start with http:// or https://");
      return;
    }
    setFeedUrls([...feedUrls, newFeedUrl]);
    setNewFeedUrl("");
    setUrlError(""); // Clear any existing error
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
              <h3>{detail.siteTitle || detail.feedTitle}</h3>
              <p className="feed-url">{feedUrls[index]}</p>
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
