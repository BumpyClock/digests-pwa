import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlButton from '@shoelace-style/shoelace/dist/react/button';
import SlIcon from '@shoelace-style/shoelace/dist/react/icon';import Feed from "./components/Feed/Feed.js";
import PullToRefresh from "react-pull-to-refresh";
import axios from 'axios';
import Settings from "./pages/settings.js";

function App() {
  const [feedItems, setFeedItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [feedDetails, setFeedDetails] = useState([]);
  const errorMessages = useMemo(
    () => [
      "Error",
      "error",
      "ERROR",
      "404",
      "Not Found",
      "not found",
      "NOT FOUND",
    ],
    []
  );
  const [feedUrls, setFeedUrls] = useState([
    "https://engadget.com/rss.xml",
    "https://www.theverge.com/rss/index.xml",
  ]);

  const [showSettings, setShowSettings] = useState(false);


  
const createRequestOptions = useCallback((urls) => {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: { urls: urls }, // send the urls array inside an object
  };
}, []);

  const fetchRSS = useCallback(async () => {
    try {
      const apiUrl = "https://rss.bumpyclock.com";
      const requestUrl = `${apiUrl}/parse`;
      const requestOptions = createRequestOptions(feedUrls);
      const response = await axios(requestUrl, requestOptions);
      const fetchedFeedData = response.data;

      if (response.status ===200) {
        setErrorMessage(""); // No error

        const feedDetails = [];
        const items = [];

        for (const feed of fetchedFeedData.feeds) {
          const isErrorTitle = errorMessages.some((msg) =>
            feed.siteTitle.includes(msg)
          );
          if (isErrorTitle) {
            feed.siteTitle = feed.feedTitle;
            console.log("no site title");
          } else {
            feed.feedUrl = feed.siteTitle;
          }

          feedDetails.push({
            siteTitle: feed.siteTitle,
            feedTitle: feed.feedTitle,
            feedUrl: feed.feedUrl,
            description: feed.description,
            author: feed.podcastInfo ? feed.podcastInfo.author : "",
            lastUpdated: feed.lastUpdated,
            lastRefreshed: feed.lastRefreshed,
            favicon: feed.favicon,
          });

          if (Array.isArray(feed.items)) {
            feed.items.forEach((item) => {
              items.push({
                id: item.id,
                title: item.title,
                siteTitle: isErrorTitle ? feed.feedTitle : feed.siteTitle,
                feedTitle: feed.feedTitle,
                thumbnail: item.thumbnail,
                link: item.link,
                feedUrl: feed.feedUrl,
                favicon: feed.favicon,
                author: item.author,
                published: item.published,
                created: item.created,
                category: item.category,
                content: item.content,
                media: item.media,
                enclosures: item.enclosures,
                podcastInfo: {
                  author: item.podcastInfo ? item.podcastInfo.author : "",
                  image: item.podcastInfo ? item.podcastInfo.image : "",
                  categories: item.podcastInfo
                    ? item.podcastInfo.categories
                    : [],
                },
              });
            });
          } else {
            console.log("feed.items is not an array: ", JSON.stringify(feed));
          }
        }

        items.sort((a, b) => b.published - a.published);

        setFeedDetails(feedDetails);
        setFeedItems(items);
      }  else {
        console.error("API response: ", JSON.stringify(fetchedFeedData));
        setErrorMessage("Server response wasn't ok: " + response.status);
        throw new Error("Server response wasn't ok: ", response.status);
      }
      console.log("🚀 ~ fetchRSS ~ feedDetails:", feedDetails)
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }// eslint-disable-next-line 
  }, [createRequestOptions]);

  useEffect(() => {
    fetchRSS();
  }, [fetchRSS]);

  const handleRefresh = useCallback(() => {
    fetchRSS();
  }, [fetchRSS]);

  const renderFeeds = () => {
    return <Feed feedItems={feedItems} />;
  };

  return (
    <div className="App">
      <header>
        <h1>Digests</h1>
<SlButton variant="default" size="large" circle onClick={() => setShowSettings(!showSettings)} style={{cursor: 'pointer', position: 'absolute', right: '20px', top: '20px'}}>
  <SlIcon slot="icon" name="gear" />
</SlButton>      </header>
      <main>
        {showSettings ? (
          <Settings feedUrls={feedUrls} setFeedUrls={setFeedUrls} />
        ) : (
          <>
            {errorMessage}
            <PullToRefresh onRefresh={handleRefresh}>
              <div id="feedContainer">{renderFeeds()}</div>
            </PullToRefresh>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
