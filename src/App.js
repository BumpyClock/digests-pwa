// App.js

import React, { useState, useCallback, useEffect, memo } from "react"; 
import "@shoelace-style/shoelace/dist/themes/light.css";
import Feed from "./components/Feed/Feed.js";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import Settings from "./pages/settings.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library";
import ListView from "./components/ListView/ListView.js";
import AppBar from "./components/AppBar/AppBar.js";
import "./App.css";
import { getConfig, defaultConfig } from './modules/indexedDB.js';



registerIconLibrary("iconoir", {
  resolver: name =>
    `https://cdn.jsdelivr.net/gh/lucaburgio/iconoir@latest/icons/regular/${name}.svg`
});

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/"
);

function App() {
  const [feedItems, setFeedItems] = useState([]);
  const [isListView, setIsListView] = useState(false);
  const [feedDetails, setFeedDetails] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(defaultConfig.refresh_interval);
  const [apiUrl, setApiUrl] = useState(defaultConfig.apiUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const SettingsMemo = memo(Settings);
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'podcast', or 'rss'
  const [openAIKey, setOpenAIKey] = useState("");

  // Initialize feedUrls from localStorage or default feeds
  const [feedUrls, setFeedUrls] = useState(() => {
    const savedFeedUrls = localStorage.getItem("feedUrls");
    return savedFeedUrls
      ? (
          console.log(
            "Found existing feed configuration",
            JSON.parse(savedFeedUrls)
          ),
          JSON.parse(savedFeedUrls)
        )
      : (
          console.log(
            "No feeds found, starting with a couple of default feeds"
          ),
          [
            "https://engadget.com/rss.xml",
            "https://www.theverge.com/rss/index.xml"
          ]
        );
  });

  useEffect(()=> {
    (async () => {
      try {
        const savedOpenAIKey = await getConfig('openAIKey', '');
        setOpenAIKey(savedOpenAIKey ? savedOpenAIKey : '');
      } catch (error) {
        console.error('No OpenAPI key is set. Set one on the Settings Page to use AI features.', error);
        setOpenAIKey('');
      }
    })();
  })

  // Fetch saved configurations
  useEffect(() => {
    (async () => {
      try {
        const savedRefreshInterval = await getConfig('refreshInterval', defaultConfig.refresh_interval);
        setRefreshInterval(savedRefreshInterval ? Number(savedRefreshInterval) : defaultConfig.refresh_interval);
      } catch (error) {
        console.error('Error fetching refresh interval:', error);
        setRefreshInterval(defaultConfig.refresh_interval);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const savedApiUrl = await getConfig('apiUrl', defaultConfig.apiUrl);
        setApiUrl(savedApiUrl ? savedApiUrl : defaultConfig.apiUrl);
      } catch (error) {
        console.error('Error fetching API URL:', error);
        setApiUrl(defaultConfig.apiUrl);
      }
    })();
  }, []);

  // Function to refresh RSS data
  const refreshRSSData = useCallback(() => {
    console.log("[RefreshRSSDATA] Refreshing RSS data");

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          if (event.data && event.data.type === "RSS_DATA") {
            setFeedDetails(event.data.payload.feedDetails);
            setFeedItems(event.data.payload.items);
            setIsLoading(false);
          }
        };
        registration.active.postMessage(
          {
            type: "FETCH_RSS",
            payload: { urls: feedUrls },
          },
          [messageChannel.port2]
        );
      });
    } else {
      console.log("Service worker not active yet; waiting for activation.");
    }
  }, [feedUrls]);

  // Handle service worker controller change
  useEffect(() => {
    const onControllerChange = () => {
      console.log("Service worker has taken control; refreshing RSS data.");
      refreshRSSData();
    };

    if (navigator.serviceWorker.controller) {
      console.log("Service worker already controlling the page; fetching RSS data.");
      refreshRSSData();
    } else {
      console.log("Service worker not active yet. Waiting for activation...");
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, [refreshRSSData]);

  const refreshFeed = useCallback(() => {
    setIsLoading(true);
    console.log("Refreshing feed");
    refreshRSSData();
  }, [refreshRSSData]);

  useEffect(
    () => {
      localStorage.setItem("feedUrls", JSON.stringify(feedUrls));
    },
    [feedUrls]
  );

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  useEffect(
    () => {
      refreshRSSData();
    },
    [feedUrls, refreshRSSData]
  );

  // Set up automatic refresh based on refreshInterval
  useEffect(
    () => {
      console.log(`Setting refresh interval to ${refreshInterval} minutes`);
      const intervalId = setInterval(() => {
        console.log("🚀 ~ RefreshTimer triggered ~ Refreshing RSS data");
        refreshRSSData();
      }, refreshInterval * 60 * 1000);

      localStorage.setItem("refreshInterval", refreshInterval.toString());

      return () => clearInterval(intervalId);
    },
    [refreshInterval, refreshRSSData]
  );

  // Listen for messages from the service worker
  useEffect(() => {
    const handleMessage = event => {
      if (event.data && event.data.type === "RSS_DATA") {
        setFeedDetails(event.data.payload.feedDetails);
        setFeedItems(event.data.payload.items);
        console.log(`Received ${event.data.payload.items.length} feed items`);
        console.log(
          `Received ${event.data.payload.feedDetails.length} feed details`
        );
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, []);

  // Check if the window is scrolled
  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", checkScroll);

    return () => {
      window.removeEventListener("scroll", checkScroll);
    };
  }, []);

  return (
    <div className="App">
      <AppBar
        isScrolled={isScrolled}
        refreshFeed={refreshFeed}
        isListView={isListView}
        setIsListView={setIsListView}
        showSettings={showSettings}
        toggleSettings={toggleSettings}
        filterType={filterType}
        setFilterType={setFilterType}
      />
      <main className={`content-container ${!isListView ? "feed-view" : ""}`}>
        {isLoading
          ? <div className="loading-indicator">
              <SlSpinner />
              <p>Preparing your Digest</p>
            </div>
          : showSettings
            ? <SettingsMemo
                feedUrls={feedUrls}
                setFeedUrls={setFeedUrls}
                feedDetails={feedDetails}
                refreshInterval={refreshInterval}
                setRefreshInterval={setRefreshInterval}
                apiUrl={apiUrl}
                setApiUrl={setApiUrl}
                openAIKey={openAIKey}
                setOpenAIKey={setOpenAIKey}
              />
            : isListView
              ? <ListView articles={feedItems} />
              : <Feed
                  feedItems={feedItems}
                  apiUrl={apiUrl}
                  filterType={filterType} 
                  openAIKey={openAIKey}
                />}
      </main>
    </div>
  );
}

export default App;
