import React, { useState, useEffect, useRef } from "react";
import {
  SlButton,
  SlInput,
  SlIcon,
  SlSpinner,
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
  const [isLoading, setIsLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const fileInputRef = useRef();

  const inputRef = useRef();

useEffect(() => {
  if (inputRef.current) {
    inputRef.current.addEventListener("input", (e) =>
      setNewFeedUrl(e.target.value)
    );
  }
}, []);

// Effect to handle the URL addition logic
useEffect(() => {
  if (detailsLoading && feedDetails.length > 0) {
    // Assuming feedDetails update means loading is done
    setIsLoading(false);
    setDetailsLoading(false);
  }
}, [feedDetails, detailsLoading]);

  const isValidUrl = (url) => {
    const pattern = new RegExp('^(https?:\\/\\/)', 'i'); 
    return pattern.test(url);
  };

  const extractUrlsFromOutlines = (outlines) => {
    let urls = [];
    outlines.forEach(outline => {
      if (outline.type === "rss" && outline["@_xmlUrl"]) {
        urls.push(outline["@_xmlUrl"]);
      }
      if (outline.outline) {
        urls = [...urls, ...extractUrlsFromOutlines(Array.isArray(outline.outline) ? outline.outline : [outline.outline])];
      }
    });
    return urls;
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
      
        setFeedUrls([...new Set([...feedUrls, ...urls])]); // Use Set to avoid duplicates
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
    ${feedUrls.map(url => `<outline type="rss" xmlUrl="${url}" />`).join("\n    ")}
  </body>
</opml>`;
  const blob = new Blob([opmlContent], { type: 'text/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'feeds.opml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};



  const handleAddFeed = () => {
    setIsLoading(true);
    setDetailsLoading(true); // Set details loading to true

  
    // Ensure input is trimmed and lowercased for consistency
    const input = newFeedUrl.trim().toLowerCase();
  
    // Debugging: Log the input
    // console.log("Input URL String:", input);
  
    // Split the input by comma or semicolon, allowing for spaces
    const urls = input.split(/\s*[,;]+\s*/);
  
    // Debugging: Log the split URLs
    // console.log("Split URLs:", urls);
  
    // Validation and addition logic
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
    <div className="settings">

      <h2>Settings</h2>
      <div className="subscription-form">
      {isLoading && <SlSpinner />}
      
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
        <input
  type="file"
  accept=".opml"
  onChange={handleFileUpload}
  style={{ display: 'none' }}
  ref={fileInputRef}
/>

<SlButton onClick={handleImportClick}>Import Feeds</SlButton>
    <SlButton onClick={handleExportFeeds}>Export Feeds</SlButton>
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
              onClick={() => handleRemoveFeed(detail.feedUrl)}
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
