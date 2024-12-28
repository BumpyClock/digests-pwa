// src/data/store.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getConfig, setConfig, defaultConfig } from '../modules/indexedDB';

const useAppStore = create(
  persist(
    (set) => ({
      feedUrls: [], // Initialize with empty values
      refreshInterval: defaultConfig.refresh_interval,
      apiUrl: defaultConfig.apiUrl,
      openAIKey: '',
      isListView: false,
      showSettings: false,
      filterType: 'all',

      setFeedUrls: async (feedUrls) => {
        set({ feedUrls });
        await setConfig('feedUrls', feedUrls);
      },
      setRefreshInterval: async (refreshInterval) => {
        set({ refreshInterval });
        await setConfig('refreshInterval', refreshInterval);
      },
      setApiUrl: async (apiUrl) => {
        set({ apiUrl });
        await setConfig('apiUrl', apiUrl);
      },
      setOpenAIKey: async (openAIKey) => {
        set({ openAIKey });
        await setConfig('openAIKey', openAIKey);
      },
      toggleListView: () =>
        set((state) => ({ isListView: !state.isListView })),
      toggleSettings: () =>
        set((state) => ({ showSettings: !state.showSettings })),
      setFilterType: (filterType) => set({ filterType }),
    }),
    {
      name: 'app-storage',
      getStorage: () => ({
        getItem: async (name) => {
          console.log(`${name} being retrieved from local storage`);
          const item = await getConfig(name);
          // Initialize store state with values from IndexedDB after hydration
          if (item) {
            // Only set state if the item exists in IndexedDB
            // Directly update the store's state after initial hydration
            useAppStore.setState(item);
          }
          return JSON.stringify(item);
        },
        setItem: async (name, value) => {
          const parsedValue = JSON.parse(value);
          await setConfig(name, parsedValue);
          console.log(`${name} set to ${value}`);
        },
        removeItem: async (name) => {
          console.log(`${name} being removed from local storage`);
        },
      }),
    }
  )
);

export default useAppStore;