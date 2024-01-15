// Settings.js
import React, { useEffect, useRef } from 'react';
import { SlButton, SlInput, SlIcon } from '@shoelace-style/shoelace/dist/react/';

function Settings({ feedUrls, setFeedUrls }) {
  const [newFeedUrl, setNewFeedUrl] = React.useState('');
  const inputRef = useRef();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('sl-change', (e) => setNewFeedUrl(e.target.value));
    }
  }, []);

  const handleAddFeed = () => {
    setFeedUrls([...feedUrls, newFeedUrl]);
    setNewFeedUrl('');
  };

  const handleRemoveFeed = (url) => {
    setFeedUrls(feedUrls.filter(feedUrl => feedUrl !== url));
  };

  return (
    <div>
      <h2>Settings</h2>
      <SlInput ref={inputRef} type="text" value={newFeedUrl} placeholder="New feed URL" />
      <SlButton onClick={handleAddFeed}>Add Feed</SlButton>
      <ul>
        {feedUrls.map(url => (
          <li key={url}>
            {url} 
            <SlButton onClick={() => handleRemoveFeed(url)}>
              <SlIcon name="x-circle"></SlIcon>
            </SlButton>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Settings;