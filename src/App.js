import React, { useState, useCallback, useEffect, useRef, memo } from "react";
import "@shoelace-style/shoelace/dist/themes/light.css";
import Feed from "./components/Feed/Feed.js";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import Settings from "./pages/settings.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library";
import ListView from "./components/ListView/ListView.js";


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
  const headerRef = useRef(null);
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const savedRefreshInterval = localStorage.getItem("refreshInterval");
    return savedRefreshInterval ? Number(savedRefreshInterval) : 15;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const SettingsMemo = memo(Settings);

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

  

  const refreshRSSData = useCallback(() => {
    console.log("[RefreshRSSDATA] Refreshing RSS data");

    if (navigator.serviceWorker.controller) {
      // Service worker is active, send a message
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
      // Service worker is not active yet; will wait for it to become active
      console.log("Service worker not active yet; waiting for activation.");
    }
  }, [feedUrls]);

  useEffect(() => {
    const onControllerChange = () => {
      console.log("Service worker has taken control; refreshing RSS data.");
      refreshRSSData();
    };
  
    // Check if the service worker is controlling the page
    if (navigator.serviceWorker.controller) {
      console.log("Service worker already controlling the page; fetching RSS data.");
      refreshRSSData();
    } else {
      console.log("Service worker not active yet. Waiting for activation...");
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    }
  
    // Cleanup the event listener on component unmount
    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
    };
  }, [refreshRSSData]);
  

  const refreshFeed = useCallback(() => {
    setIsLoading(true); // Set loading to true when refresh starts
    console.log("Refreshing feed");
    refreshRSSData();
  }, [refreshRSSData]);

  useEffect(
    () => {
      localStorage.setItem("feedUrls", JSON.stringify(feedUrls));
    },
    [feedUrls]
  );
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = useCallback(() => {
    setShowSettings(show => !show);
  }, []);

  useEffect(
    () => {
      // Inside handleRefresh and the useEffect hook
      refreshRSSData();
    },
    [feedUrls, refreshRSSData]
  );

  useEffect(
    () => {
      console.log(`Setting refresh interval to ${refreshInterval} minutes`);
      const intervalId = setInterval(() => {
        console.log("Refreshing RSS data");
        refreshRSSData();
      }, refreshInterval * 60 * 1000); // Convert refreshInterval from minutes to milliseconds

      // Save the refresh interval to localStorage
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

  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 0) {
        // headerRef.current.classList.add("title-bar-small", "title-bar-shadow");
        setIsScrolled(true);
      } else {
        // headerRef.current.classList.remove(
        //   "title-bar-small",
        //   "title-bar-shadow"
        // );
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
    
      <header className="top-bar" ref={headerRef}>
        <h1 className="title">Digests</h1>
        <div className="button-container">
          <SlIconButton
          id="refreshButton"
            className="refresh"
            name="refresh"
            size="large"
            library="iconoir"
            style={{
              cursor: "pointer",
              fontSize: isScrolled ? "1.5rem" : "1.5rem"
            }}
            onClick={refreshFeed}
          />
          <SlIconButton
            className="view-toggle"
            name={isListView ? "view-grid" : "list"}
            size="large"
            library="iconoir"
            style={{
              cursor: "pointer",

              fontSize: isScrolled ? "1.5rem" : "1.5rem"
            }}
            onClick={() => setIsListView(prev => !prev)}
          />
          <SlIconButton
            name={showSettings ? "xmark" : "settings"}
            size="large"
            library="iconoir"
            id="settingsButton"
            style={{
              cursor: "pointer",
              fontSize: isScrolled ? "1.5rem" : "1.5rem"
            }}
            onClick={event => {
              toggleSettings();
              event.currentTarget.blur();
            }}
          />
        </div>
      </header>
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
              />
            : isListView
              ? <ListView articles={feedItems} />
              : <Feed feedItems={feedItems} />}
      </main>
    </div>
  );
}

export default App;
