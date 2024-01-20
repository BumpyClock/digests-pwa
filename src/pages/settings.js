import React, { useEffect, useRef } from "react";
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
  setRefreshInterval
}) {
  const [newFeedUrl, setNewFeedUrl] = React.useState("");
  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener("sl-change", e =>
        setNewFeedUrl(e.target.value)
      );
    }
  }, []);

  const handleAddFeed = () => {
    setFeedUrls([...feedUrls, newFeedUrl]);
    setNewFeedUrl("");
  };

  const handleRemoveFeed = url => {
    setFeedUrls(feedUrls.filter(feedUrl => feedUrl !== url));
  };

  return (
    <div className="settings">
      <h2>Settings</h2>
      <SlInput
        ref={inputRef}
        type="text"
        value={newFeedUrl}
        placeholder="New feed URL"
      />
      <SlButton onClick={handleAddFeed}>Add Feed</SlButton>
      <div id="subscribed-feeds-list">
        {feedDetails.map((detail, index) =>
          <div key={feedUrls[index]} className="list-item">
            <div className="website-info">
              <img
                className="site-favicon"
                src={detail.favicon}
                alt={`${detail.siteTitle || detail.feedTitle} Favicon`}
              />
              <h3>
                {detail.siteTitle || detail.feedTitle}
              </h3>
              <p className="feed-url">
                {feedUrls[index]}
              </p>
            </div>
            <button
              className="remove-feed-button"
              onClick={() => handleRemoveFeed(feedUrls[index])}
            >
              <p className="unsubscribe-button">Unsubscribe</p>
            </button>
          </div>
        )}
      </div>

      <SlInput
        type="number"
        label="Refresh Interval (minutes):"
        value={refreshInterval}
        onChange={e => setRefreshInterval(e.target.value)}
      />
    </div>
  );
}

export default Settings;
