import React, { useState, useRef } from 'react';
import {
  SlButton,
  SlInput,
  SlIcon,
  SlSpinner,
} from '@shoelace-style/shoelace/dist/react/';
import './settings.css';
import { defaultConfig, setConfig } from '../modules/indexedDB.js';
import FeedList from '../components/FeedList/FeedList.js';
import useAppStore from '../data/store.js';
import { useQueryClient } from 'react-query';

function Settings({ feedDetails }) {
  const queryClient = useQueryClient();
  const {
    feedUrls,
    setFeedUrls,
    refreshInterval,
    setRefreshInterval,
    openAIKey,
    setOpenAIKey,
    setApiUrl,
  } = useAppStore();
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  /**
   * @function isValidUrl
   * @param {string} url - The URL to validate.
   * @returns {boolean} True if the URL is valid, false otherwise.
   * @description Validates a URL using a regular expression.
   */
  const isValidUrl = (url) => {
    const pattern = new RegExp(
      '^(https?:\\/\\/www\\.|https?:\\/\\/|www\\.)?[a-zA-Z0-9-]+(\\.[a-zA-Z]{2,})(:\\d{2,5})?(\\/.*)?$',
      'i'
    );
    return pattern.test(url);
  };

  /**
   * @function handleFileUpload
   * @param {Event} event - The file upload event.
   * @description Handles the file upload event, reads the OPML file, and updates the feed URLs.
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(e.target.result, 'text/xml');

        let urls = [];
        const outlines = xmlDoc.getElementsByTagName('outline');
        for (let i = 0; i < outlines.length; i++) {
          const outline = outlines[i];
          if (outline.getAttribute('type') === 'rss') {
            const xmlUrl = outline.getAttribute('xmlUrl');
            if (xmlUrl) {
              urls.push(xmlUrl);
            }
          }
        }

        // Update the feedUrls state
        const updatedFeedUrls = [...new Set([...feedUrls, ...urls])];
        setFeedUrls(updatedFeedUrls);
        await setConfig('feedUrls', updatedFeedUrls);

        // Invalidate the rssData query to trigger a refetch
        queryClient.invalidateQueries('rssData');
      };
      reader.readAsText(file);
    }
  };

  /**
   * @function handleExportFeeds
   * @description Exports the current feed URLs to an OPML file.
   */
  const handleExportFeeds = () => {
    const opmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>Your Feed Export</title>
  </head>
  <body>
    ${feedUrls
      .map((url) => `<outline type="rss" xmlUrl="${url}" />`)
      .join('\n    ')}
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

  /**
   * @function handleAddFeed
   * @description Adds a new feed URL to the list of feed URLs.
   */
  const handleAddFeed = async () => {
    setIsLoading(true);

    const input = newFeedUrl.trim();
    const urls = input.split(/\s*[,;]+\s*/);

    let allUrlsValid = true;
    let alreadyAddedUrl = null;

    for (const url of urls) {
      if (!url || !isValidUrl(url)) {
        setUrlError(`Invalid URL: ${url}. It must be a valid URL.`);
        allUrlsValid = false;
        break;
      }

      if (feedUrls.includes(url)) {
        alreadyAddedUrl = url;
        allUrlsValid = false;
        break;
      }
    }

    if (allUrlsValid) {
      // Update the feedUrls state
      const updatedFeedUrls = [...feedUrls, ...urls];
      setFeedUrls(updatedFeedUrls);
      await setConfig('feedUrls', updatedFeedUrls);

      // Invalidate the rssData query to trigger a refetch
      queryClient.invalidateQueries('rssData');

      setNewFeedUrl('');
      setUrlError('');
    } else {
      setUrlError(
        alreadyAddedUrl
          ? `URL already added: ${alreadyAddedUrl}`
          : 'One or more URLs are invalid.'
      );
    }

    setIsLoading(false);
  };

  /**
   * @function handleOpenAIKey
   * @param {string} key - The OpenAI API key.
   * @description Sets the OpenAI API key in the store and local storage.
   */
  const handleOpenAIKey = async (key) => {
    setOpenAIKey(key);
    await setConfig('openAIKey', key);
  };

  /**
  * @function handleRemoveFeed
  * @param {string} url - The URL of the feed to remove.
  * @description Removes a feed URL from the list of feed URLs.
  */
  const handleRemoveFeed = (url) => {
    // Filter out the URL to be removed directly
    const updatedFeedUrls = feedUrls.filter(
      (feedUrl) => feedUrl.trim() !== url.trim()
    );
  
    // Update the Zustand store
    setFeedUrls(updatedFeedUrls);
  
    // Update the feedUrls in local storage
    setConfig("feedUrls", updatedFeedUrls);
  
    // Invalidate the rssData query to trigger a refetch
    queryClient.invalidateQueries("rssData");
  };

  /**
   * @function handleImportClick
   * @description Opens the file input dialog for OPML file import.
   */
  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <div className="settings-section">
        <div className="infoContainer">
          <h3>Manage Feeds</h3>
          <p>Add, remove, and import feeds.</p>
        </div>
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
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <SlButton onClick={handleImportClick}>Import Feeds</SlButton>
          <SlButton onClick={handleExportFeeds}>Export Feeds</SlButton>
        </div>
      </div>

      {urlError && <p className="error-message">{urlError}</p>}
      <div
        className="settings-section"
        style={{ display: 'inline-block', width: '100%' }}
      >
        <div className="infoContainer">
          <h3>Subscribed Feeds</h3>
          <p>Manage your subscribed feeds.</p>
        </div>
        <div id="subscribed-feeds-list">
          {feedDetails.length > 0 ? (
            <FeedList
              feeds={feedDetails}
              onRemoveFeed={handleRemoveFeed}
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
          onInput={(e) => setRefreshInterval(Number(e.target.value))}
        />
      </div>
      <div className="settings-section" id="openAISection">
        <div className="infoContainer">
          <h3>Enable AI Features</h3>
          <p>
            Enter your OpenAI API key to use the AI summarization feature and
            text to speech.
          </p>
        </div>
        <SlInput
          id="openAIKey"
          type="password"
          label="API Key:"
          placeholder="sk-XXXXXXXXXXXXXXXXXXXXXXXX"
          value={openAIKey}
          onInput={(e) => handleOpenAIKey(e.target.value)}
        />
      </div>

      <div className="settings-section">
        <div className="infoContainer">
          <h3>API endpoint</h3>
          <p>Set a custom API endpoint. For advanced users only</p>
        </div>

        <SlInput
          id="apiUrl"
          type="url"
          label="API URL:"
          placeholder="https://api.example.com"
          value={useAppStore.getState().apiUrl}
          onInput={(e) => setApiUrl(e.target.value)}
        />
        <SlButton onClick={() => setApiUrl(defaultConfig.apiUrl)}>
          Reset to Default
        </SlButton>
      </div>
    </div>
  );
}

export default Settings;