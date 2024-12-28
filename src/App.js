// src/App.js
import React, { useCallback } from 'react';
import '@shoelace-style/shoelace/dist/themes/light.css';
import Feed from './components/Feed/Feed.js';
import Settings from './pages/settings.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';
import { registerIconLibrary } from '@shoelace-style/shoelace/dist/utilities/icon-library';
import AppBar from './components/AppBar/AppBar.js';
import './App.css';
import useAppStore from './data/store.js';
import { useQueryClient } from 'react-query';
import useServiceWorker from './hooks/useServiceWorker.js';
import { Routes, Route, Outlet } from 'react-router-dom';
import ReaderViewWrapper from './components/ReaderView/ReaderViewWrapper.js';

registerIconLibrary('iconoir', {
  resolver: (name) =>
    `https://cdn.jsdelivr.net/gh/lucaburgio/iconoir@latest/icons/regular/${name}.svg`,
});

setBasePath(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.0/cdn/'
);

function App() {
  const { apiUrl, openAIKey } = useAppStore();

  const queryClient = useQueryClient();

  // Get data from useServiceWorker
  const { isLoading, error, data } = useServiceWorker();

  const refreshFeed = useCallback(() => {
    console.log('Refreshing feed');
    queryClient.invalidateQueries('rssData');
  }, [queryClient]);

  if (error) {
    console.error('Service worker error:', error);
  }

  return (
    <div className="App">
      <AppBar refreshFeed={refreshFeed} />
      <main className="content-container feed-view">
        {isLoading && (
          <div className="loading-indicator">
            <sl-spinner />
            <p>Preparing your Digest</p>
          </div>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Feed
                  feedItems={data?.items || []}
                  apiUrl={apiUrl}
                  openAIKey={openAIKey}
                />
                <Outlet /> {/* Render nested routes here */}
              </>
            }
          >
            <Route
              path="readerview/:encodedLink"
              element={<ReaderViewWrapper items={data?.items || []} />}
            />
          </Route>
          <Route
            path="/settings"
            element={<Settings feedDetails={data?.feedDetails || []} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;