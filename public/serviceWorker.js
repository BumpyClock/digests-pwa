/* eslint-disable no-restricted-globals */
// Activate the new service worker and take control of the pages
const CACHE_NAME = '9_18_24_v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/', // Ensure this path is correct
        '/index.html', // Remove wildcard and specify exact path
        '/static/js/bundle.js', // Ensure this path is correct
        // Add other paths as needed
      ]).catch((error) => {
        console.error('Failed to cache resources during install:', error);
      });
    })
  );
  console.log("Service worker installed");
  // Activate the service worker immediately after installation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => CACHE_NAME !== cacheName)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  // Claim control over all clients (pages) immediately
  console.log("service worker activated");
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first, fallback to cache if network fails
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response and store a copy in the cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try to serve from cache
        return caches.match(event.request)
          .then((cachedResponse) => cachedResponse || new Response("Offline"));
      })
  );
});



const errorMessages = ["Error: no title", "Error: no link"]; // Add your error messages here

function createRequestOptions(feedUrls) {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ urls: feedUrls }),
  };
}

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 10000 } = options; // 10-second timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const response = await fetch(resource, { ...options, signal: controller.signal });
  clearTimeout(id);
  return response;
}


async function fetchRSS(feedUrls) {
  let feedDetails = [];
  let items = [];
  try {
    const apiUrl = "https://api.digests.app";
    const requestUrl = `${apiUrl}/parse`;
    const requestOptions = createRequestOptions(feedUrls);
    const response = await fetchWithTimeout(requestUrl, requestOptions);

    console.log("Response status: ", response.status);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      result += decoder.decode(value, { stream: !done });
    }

    try {
      let fetchedFeedData = {};

      try {
        fetchedFeedData = JSON.parse(result);
        console.log(fetchedFeedData);
      } catch (e) {
        console.log("Error parsing JSON: ", e);
        console.log("Response text that caused parsing error: ", result);
      }

      if (response.status === 200) {
        for (const feed of fetchedFeedData.feeds) {
          const isErrorTitle = errorMessages.some((msg) =>
            feed.siteTitle.includes(msg)
          );
          if (isErrorTitle) {
            feed.siteTitle = feed.feedTitle;
            console.log("no site title");
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
                thumbnailColor: item.thumbnailColor,
                description: item.description,
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
            // Gracefully handle non-array feed.items by continuing to the next feed
          }
        }
        items.sort((a, b) => new Date(b.published) - new Date(a.published));
      } else {
        console.error("API response: ", JSON.stringify(fetchedFeedData));
        throw new Error("Server response wasn't ok: ", response.status);
      }
    } catch (parseError) {
      console.error("Error parsing JSON: ", parseError);
      console.error("Response text that caused parsing error: ", result);
      throw parseError;
    }
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }

  return { feedDetails, items };
}

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'FETCH_RSS') {
    const feedData = await fetchRSS(event.data.payload.urls);
    // Send the fetched data back to the main thread
    event.ports[0].postMessage({
      type: 'RSS_DATA',
      payload: feedData,
    });
  }
});