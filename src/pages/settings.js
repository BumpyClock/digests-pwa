import React, { useState, useRef } from "react";
import {
  SlButton,
  SlInput,
  SlIcon,
  SlSpinner,
} from "@shoelace-style/shoelace/dist/react/";
import "./settings.css";
import FeedList from "../components/FeedList/FeedList.js"; // Make sure this path is correct for FeedList

function Settings({
  feedUrls,
  setFeedUrls,
  feedDetails,
  refreshInterval,
  setRefreshInterval,
}) {
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef();

  const isValidUrl = (url) => {
    const pattern = new RegExp("^(https?:\\/\\/)", "i");
    return pattern.test(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(e.target.result, "text/xml");

        let urls = [];
        const outlines = xmlDoc.getElementsByTagName("outline");
        for (let i = 0; i < outlines.length; i++) {
          const outline = outlines[i];
          if (outline.getAttribute("type") === "rss") {
            const xmlUrl = outline.getAttribute("xmlUrl");
            if (xmlUrl) {
              urls.push(xmlUrl);
            }
          }
        }

        setFeedUrls([...new Set([...feedUrls, ...urls])]);
      };
      reader.readAsText(file);
    }
  };

  const handleExportFeeds = () => {
    const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Your Feed Export</title>
  </head>
  <body>
    ${feedUrls
      .map((url) => `<outline type="rss" xmlUrl="${url}" />`)
      .join("\n    ")}
  </body>
</opml>`;
    const blob = new Blob([opmlContent], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "feeds.opml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddFeed = () => {
    setIsLoading(true);

    const input = newFeedUrl.trim();
    const urls = input.split(/\s*[,;]+\s*/);

    for (const url of urls) {
      if (!url || !isValidUrl(url)) {
        setUrlError(`Invalid URL: ${url}. It must start with http:// or https://`);
        setIsLoading(false);
        return;
      }

      if (feedUrls.includes(url)) {
        setUrlError(`URL already added: ${url}`);
        setIsLoading(false);
        return;
      }
    }

    setFeedUrls([...feedUrls, ...urls]);
    setNewFeedUrl("");
    setUrlError("");
    setIsLoading(false);
  };

  const handleRemoveFeed = (url) => {
    console.log("Removing feed:", url);
    setFeedUrls(feedUrls.filter((feedUrl) => feedUrl.trim() !== url.trim()));
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-section">
        <div className="subscription-form">
          {isLoading && <SlSpinner />}
          <SlInput
            type="url"
            value={newFeedUrl}
            placeholder="http://feed.url/rss.xml"
            clearable
            onInput={(e) => setNewFeedUrl(e.target.value)}
          >
            <SlIcon library="iconoir" name="rss-feed" slot="prefix"></SlIcon>
          </SlInput>
          <SlButton onClick={handleAddFeed}>Add Feed</SlButton>
          <input
            type="file"
            accept=".opml"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            ref={fileInputRef}
          />
          <SlButton onClick={handleImportClick}>Import Feeds</SlButton>
          <SlButton onClick={handleExportFeeds}>Export Feeds</SlButton>
        </div>
      </div>

      {urlError && <p className="error-message">{urlError}</p>}
      <div className="settings-section" style={{ display: "inline-block", width:"100%" }}> 
        <div className="infoContainer">
          <h3>Subscribed Feeds</h3>
          <p>Manage your subscribed feeds.</p>
          </div>
          <div id="subscribed-feeds-list">
        {feedDetails && feedDetails.length > 0 ? (
          <FeedList
            feeds={feedDetails}
            onRemoveFeed={handleRemoveFeed} // Pass the handleRemoveFeed function
          />
        ) : (
          <p>No feeds found. Please add some feeds.</p>
        )}
      </div>
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