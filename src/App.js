import React, { useState, useCallback, useEffect } from "react";
import "@shoelace-style/shoelace/dist/themes/light.css";
import Feed from "./components/Feed/Feed.js";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import Settings from "./pages/settings.js";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import { registerIconLibrary } from "@shoelace-style/shoelace/dist/utilities/icon-library";

registerIconLibrary("iconoir", {
  resolver: (name) =>
    `https://cdn.jsdelivr.net/gh/lucaburgio/iconoir@latest/icons/regular/${name}.svg`,
});

setBasePath(
  "https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.12.0/cdn/"
);

function App() {
  const [feedItems, setFeedItems] = useState([]);
  const [feedDetails, setFeedDetails] = useState([]);
  const [refreshInterval, setRefreshInterval] = useState(() => {
    const savedRefreshInterval = localStorage.getItem("refreshInterval");
    return savedRefreshInterval ? Number(savedRefreshInterval) : 15;
  });
  const [isLoading, setIsLoading] = useState(true);

  const [feedUrls, setFeedUrls] = useState(() => {
    const savedFeedUrls = localStorage.getItem("feedUrls");
    return savedFeedUrls
      ? (console.log("Found existing feed configuration, loading those"),
        JSON.parse(savedFeedUrls))
      : (console.log("No feeds found, starting with a couple of default feeds"),
        [
          "https://engadget.com/rss.xml",
          "https://www.theverge.com/rss/index.xml",
        ]);
  });

  const refreshRSSData = useCallback(() => {
    navigator.serviceWorker.ready.then((registration) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === "RSS_DATA") {
          setFeedDetails(event.data.payload.feedDetails);
          setFeedItems(event.data.payload.items);
          setIsLoading(false); // Set loading to false when data is received
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
  }, [feedUrls]);

  useEffect(() => {
    localStorage.setItem("feedUrls", JSON.stringify(feedUrls));
  }, [feedUrls]);
  const [showSettings, setShowSettings] = useState(false);
  const toggleSettings = useCallback(() => {
    setShowSettings((show) => !show);
  }, []);

  useEffect(() => {
    // Inside handleRefresh and the useEffect hook
    refreshRSSData();
  }, [feedUrls, refreshRSSData]);

  useEffect(() => {
    console.log(`Setting refresh interval to ${refreshInterval} minutes`);
    const intervalId = setInterval(() => {
      console.log("Refreshing RSS data");
      refreshRSSData();
    }, refreshInterval * 60 * 1000); // Convert refreshInterval from minutes to milliseconds

    // Save the refresh interval to localStorage
    localStorage.setItem("refreshInterval", refreshInterval.toString());

    return () => clearInterval(intervalId);
  }, [refreshInterval, refreshRSSData]);

  // Listen for messages from the service worker
  useEffect(() => {
    const handleMessage = (event) => {
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

  return (
    <div className="App">
      <header>
        <h1>Digests</h1>
        <SlIconButton
          name={showSettings ? "xmark" : "settings"}
          size="large"
          library="iconoir"
          style={{
            cursor: "pointer",
            position: "absolute",
            right: "20px",
            top: "20px",
            fontSize: "2rem",
          }}
          onClick={(event) => {
            toggleSettings();
            event.currentTarget.blur();
          }}
        />
      </header>
      <main>
        {isLoading ? (
          <div>
            <SlSpinner />
            <p>Preparing your Digest</p>
          </div>
        ) : // Show loading spinner while waiting for data
        showSettings ? (
          <Settings
            feedUrls={feedUrls}
            setFeedUrls={setFeedUrls}
            feedDetails={feedDetails}
            refreshInterval={refreshInterval}
            setRefreshInterval={setRefreshInterval}
          />
        ) : (
          <Feed feedItems={feedItems} />
        )}
      </main>
    </div>
  );
}

export default App;
