import React, {
  useState,
  useCallback,
  useEffect
} from "react";
import '@shoelace-style/shoelace/dist/themes/light.css';
import SlButton from '@shoelace-style/shoelace/dist/react/button';
import SlIcon from '@shoelace-style/shoelace/dist/react/icon';import Feed from "./components/Feed/Feed.js";

import Settings from "./pages/settings.js";
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/');

function App() {
  const [feedItems, setFeedItems] = useState([]);
  const [feedDetails, setFeedDetails] = useState([]);

  const [feedUrls, setFeedUrls] = useState([
    "https://engadget.com/rss.xml",
    "https://www.theverge.com/rss/index.xml",
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = useCallback(() => {
    setShowSettings(show => !show);
  }, []);


  useEffect(() => {// Inside handleRefresh and the useEffect hook
    navigator.serviceWorker.ready.then((registration) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = event => {
        if (event.data && event.data.type === 'RSS_DATA') {
          setFeedDetails(event.data.payload.feedDetails);
          setFeedItems(event.data.payload.items);
        }
      };
      registration.active.postMessage({
        type: 'FETCH_RSS',
        payload: { urls: feedUrls },
      }, [messageChannel.port2]);
    });
    
}, [feedUrls]);

// Listen for messages from the service worker

useEffect(() => {
  const handleMessage = (event) => {
    if (event.data && event.data.type === 'RSS_DATA') {
      setFeedDetails(event.data.payload.feedDetails);
      setFeedItems(event.data.payload.items);
      console.log(`Received ${event.data.payload.items.length} feed items`);
      console.log(`Received ${event.data.payload.feedDetails.length} feed details`);
    }
  };

  navigator.serviceWorker.addEventListener('message', handleMessage);

  return () => {
    navigator.serviceWorker.removeEventListener('message', handleMessage);
  };
}, []);


const renderFeeds = useCallback(() => {
  return <Feed feedItems={feedItems} />;
}, [feedItems]);

return (
  <div className="App">
    <header>
      <h1>Digests</h1>
      <SlButton variant="default" size="large" circle onClick={toggleSettings} style={{cursor: 'pointer', position: 'absolute', right: '20px', top: '20px'}}>
        <SlIcon slot="icon" name="gear" />
      </SlButton>
    </header>
    <main>
      {showSettings ? (
        <Settings feedUrls={feedUrls} setFeedUrls={setFeedUrls} feedDetails={feedDetails} />
      ) : (
        <>
          <div id="feedContainer">{renderFeeds()}</div>
        </>
      )}
    </main>
  </div>
);
}

export default App;
