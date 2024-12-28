// src/App.js
import React, { useCallback, useEffect } from 'react';
import '@shoelace-style/shoelace/dist/themes/light.css';
import Feed from './components/Feed/Feed';
import Settings from './pages/settings';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';
import { registerIconLibrary } from '@shoelace-style/shoelace/dist/utilities/icon-library';
import AppBar from './components/AppBar/AppBar';
import './App.css';
import useAppStore from './data/store';
import { useQueryClient } from 'react-query';
import useServiceWorker from './hooks/useServiceWorker';
import { Routes, Route, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ReaderViewWrapper from './components/ReaderView/ReaderViewWrapper';

registerIconLibrary('iconoir', {
  resolver: (name) =>
    `https://cdn.jsdelivr.net/gh/lucaburgio/iconoir@latest/icons/regular/${name}.svg`,
});

setBasePath(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.0/cdn/'
);

/**
 * @function App
 * @description The main application component.
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
  const { apiUrl, openAIKey } = useAppStore();

  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from useServiceWorker
  const { isLoading, error, data } = useServiceWorker();

  const refreshFeed = useCallback(() => {
    console.log('Refreshing feed');
    queryClient.invalidateQueries('rssData');
  }, [queryClient]);

  useEffect(() => {
    const handleRouteChange = () => {
      const isReaderView = location.pathname.startsWith('/readerview');
      if (!isReaderView && location.state?.fromReaderView) {
        // Refresh the feed if navigating away from readerview
        refreshFeed();
      }
    };

    // Listen for a custom event that signals a route change
    window.addEventListener('routeChange', handleRouteChange);

    return () => {
      window.removeEventListener('routeChange', handleRouteChange);
    };
  }, [location, refreshFeed]);

  useEffect(() => {
    const handleNavigation = (event) => {
      // Check if the user is navigating within the app using forward/back buttons
      if (
        event.persisted ||
        (window.performance && window.performance.navigation.type === 2)
      ) {
        // If navigating to the readerview, set the state to indicate it
        if (location.pathname.startsWith('/readerview')) {
          navigate(location.pathname, {
            state: { fromReaderView: true },
            replace: true,
          });
        } else {
          refreshFeed();
        }
      }
    };

    window.addEventListener('popstate', handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [location, navigate, refreshFeed]);

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
                <Outlet />
              </>
            }
          >
            <Route
              path="readerview/*"
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