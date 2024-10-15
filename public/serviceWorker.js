/* eslint-disable no-restricted-globals */
// Activate the new service worker and take control of the pages
const CACHE_NAME = '10_15_24_11_00_AM';

var apiUrl = "";
const DB_NAME = "digests-app";
const STORE_NAME = "digests-config";
const defaultConfig = {
  apiUrl: "https://api.digests.app",
  theme: "system",
};

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

  // Usage example
  (async () => {
    apiUrl = await getConfig('apiUrl', defaultConfig.apiUrl);
    console.log('API URL:', apiUrl);

    // Example of setting another config
    await setConfig('theme', 'dark');
    const theme = await getConfig('theme', 'light');
    console.log('Theme:', theme);
  })();
  console.log("Service worker installed with API URL: ", apiUrl);
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
  console.log("service worker activated with API URL: ", apiUrl);
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    // If the request is not a GET request, just fetch it from the network
    event.respondWith(fetch(event.request));
    return;
  }

  // Filter out requests with unsupported schemes
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Network-first, fallback to cache if network fails
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone response and store a copy in the cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Ensure only GET requests are cached
          if (event.request.method === 'GET') {
            cache.put(event.request, responseClone);
          }
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

const errorMessages = ["Error: no title", "Error: no link"]; // Add your error messages here

async function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function getConfigFromIndexedDB(key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function setConfig(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function getConfig(key, defaultValue) {
  // Check if the config is already in IndexedDB
  const cachedConfig = await getConfigFromIndexedDB(key);
  if (cachedConfig) {
    console.log(`Config for ${key} from IndexedDB: `, cachedConfig);
    return cachedConfig;
  }

  // If not in IndexedDB, use default value and store it in IndexedDB
  console.log(`Config for ${key} not found in cache. Using default value: `, defaultValue);
  await setConfig(key, defaultValue);
  return defaultValue;
}

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
  const { timeout = 30 * 1000 } = options; // 30-second timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function fetchRSS(feedUrls) {
  let feedDetails = [];
  let items = [];
  try {
    if (apiUrl === "") {
      apiUrl = await getConfig('apiUrl', defaultConfig.apiUrl);
    }
    const requestUrl = `${apiUrl}/parse`;
    console.log("🚀 ~ fetchRSS ~ requestUrl:", requestUrl)
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
                feedImage: feed.favicon,
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
                type: item.type,
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