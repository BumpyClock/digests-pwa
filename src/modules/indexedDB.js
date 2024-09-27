const DB_NAME = "digests-app";
const STORE_NAME = "digests-config";
const defaultConfig = {
  apiUrl: "https://api.digests.app",
  theme: "system",
  refreshInterval: 15,
  AiFeatures: false,
  feedUrls: [
    "https://engadget.com/rss.xml",
    "https://www.theverge.com/rss/index.xml",
    "https://www.wired.com/feed/rss",
    "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
    "https://www.npr.org/rss/rss.php?id=1001",
    "https://feeds.bbci.co.uk/news/rss.xml",
  ],
};

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

async function getConfig(key) {
  // Check if the config is already in IndexedDB
  const cachedConfig = await getConfigFromIndexedDB(key);
  if (cachedConfig !== undefined) {
    console.log(`Config for ${key} from IndexedDB: `, cachedConfig);
    return cachedConfig;
  }

  // Check if the key exists in defaultConfig
  if (!(key in defaultConfig)) {
    console.error(`Error: Config key "${key}" not found in defaultConfig.`);
    return undefined; // or throw an error, or handle it as needed
  }

  // If not in IndexedDB, use default value from defaultConfig and store it in IndexedDB
  const defaultValue = defaultConfig[key];
  console.log(`Config for ${key} not found in cache. Using default value: `, defaultValue);
  await setConfig(key, defaultValue);
  return defaultValue;
}

export { getConfig, setConfig, defaultConfig };