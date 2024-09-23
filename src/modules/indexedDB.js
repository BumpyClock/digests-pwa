const DB_NAME = "digests-app";
const STORE_NAME = "digests-config";

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

  export { getConfig, setConfig };