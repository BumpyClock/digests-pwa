import React, {
  useState,
  useCallback,
  useEffect
} from "react";
import '@shoelace-style/shoelace/dist/themes/light.css';
import SlButton from '@shoelace-style/shoelace/dist/react/button';
import SlIcon from '@shoelace-style/shoelace/dist/react/icon';
import Feed from "./components/Feed/Feed.js";
import SlSpinner from '@shoelace-style/shoelace/dist/react/spinner';
import Settings from "./pages/settings.js";
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';

setBasePath('https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/');

function App() {
  const [feedItems, setFeedItems] = useState([]);
  const [feedDetails, setFeedDetails] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const savedRefreshInterval = localStorage.getItem('refreshInterval');
    return savedRefreshInterval ? Number(savedRefreshInterval) : 15;
  });
  const [isLoading, setIsLoading] = useState(true);

  const [feedUrls, setFeedUrls] = useState(() => {
    const savedFeedUrls = localStorage.getItem('feedUrls');
    return savedFeedUrls ? (console.log("Found existing feed configuration, loading those"), JSON.parse(savedFeedUrls)) : (console.log("No feeds found, starting with a couple of default feeds"), ["https://engadget.com/rss.xml", "https://www.theverge.com/rss/index.xml"]);
  });

  function refreshRSSData() {
    navigator.serviceWorker.ready.then((registration) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = event => {
        if (event.data && event.data.type === 'RSS_DATA') {
          setFeedDetails(event.data.payload.feedDetails);
          setFeedItems(event.data.payload.items);
          setIsLoading(false); // Set loading to false when data is received
        }
      };
      registration.active.postMessage({
        type: 'FETCH_RSS',
        payload: { urls: feedUrls },
      }, [messageChannel.port2]);
    });
  }

  useEffect(() => {
    localStorage.setItem('feedUrls', JSON.stringify(feedUrls));
  }, [feedUrls]);
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = useCallback(() => {
    setShowSettings(show => !show);
  }, []);


  useEffect(() => {// Inside handleRefresh and the useEffect hook
    refreshRSSData();

  }, [feedUrls]);

  useEffect(() => {
    console.log(`Setting refresh interval to ${refreshInterval} minutes`);
    const intervalId = setInterval(() => {
      console.log('Refreshing RSS data');
      refreshRSSData();
    }, refreshInterval * 60 * 1000); // Convert refreshInterval from minutes to milliseconds

    // Save the refresh interval to localStorage
    localStorage.setItem('refreshInterval', refreshInterval.toString());

    return () => clearInterval(intervalId);
  }, [refreshInterval]);

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




  return (
    <div className="App">
      <header>
        <h1>Digests</h1>
        <SlButton variant="default" size="large" circle onClick={toggleSettings} style={{ cursor: 'pointer', position: 'absolute', right: '20px', top: '20px' }}>
          <SlIcon name={showSettings ? "x" : "gear"} />
        </SlButton>
      </header>
      <main>
      {isLoading ? (
        <div><SlSpinner /><p>Getting your feeds</p></div>
         // Show loading spinner while waiting for data
      ) : showSettings ? (
        <Settings feedUrls={feedUrls} setFeedUrls={setFeedUrls} feedDetails={feedDetails} refreshInterval={refreshInterval} setRefreshInterval={setRefreshInterval} />
      ) : (
        <Feed feedItems={feedItems} />
      )}
    </main>
    </div>
  );
}

export default App;
