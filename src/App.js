// src/App.js
import React, { useCallback, Suspense, useMemo } from 'react';
import '@shoelace-style/shoelace/dist/themes/light.css';
import Settings from './pages/settings.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path';
import { registerIconLibrary } from '@shoelace-style/shoelace/dist/utilities/icon-library';
import AppBar from './components/AppBar/AppBar.js';
import './App.css';
import useAppStore from './data/store.js';
import { useQueryClient } from 'react-query';
import useServiceWorker from './hooks/useServiceWorker.js';
import { Routes, Route } from 'react-router-dom';

const Feed = React.lazy(() => import('./components/Feed/Feed.js'));
const ReaderViewWrapper = React.lazy(() =>
  import('./components/ReaderView/ReaderViewWrapper.js')
);

registerIconLibrary('iconoir', {
  resolver: (name) =>
    `https://cdn.jsdelivr.net/gh/lucaburgio/iconoir@latest/icons/regular/${name}.svg`,
});

setBasePath(
  'https://cdn.jsdelivr.net/npm/@shoelace-style/shoelace@2.19.0/cdn/'
);

// Error Boundary Component (for catching rendering errors)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

function App() {
  const { apiUrl, openAIKey } = useAppStore();
  const queryClient = useQueryClient();
  const { isLoading, error, data } = useServiceWorker();

  console.log('App component rendering'); // Log when App renders

  const refreshFeed = useCallback(() => {
    console.log('Refreshing feed');
    queryClient.invalidateQueries('rssData');
  }, [queryClient]);

  const memoizedFeedItems = useMemo(() => {
    console.log('Memoizing feedItems');
    return data?.items || [];
  }, [data?.items]);

  if (error) {
    console.error('Service worker error:', error);
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <AppBar refreshFeed={refreshFeed} />
        <main className="content-container feed-view">
          {isLoading && (
            <div className="loading-indicator">
              <sl-spinner />
              <p>Preparing your Digest</p>
            </div>
          )}
          <Suspense fallback={<div className="loading-indicator">Loading...</div>}>
            <Routes>
              <Route
                path="/"
                element={
                  <Feed
                    feedItems={memoizedFeedItems} // Pass memoizedFeedItems
                    apiUrl={apiUrl}
                    openAIKey={openAIKey}
                  />
                }
              />
              <Route
                path="/settings"
                element={<Settings feedDetails={data?.feedDetails || []} />}
              />
              <Route
                path="/readerview/:encodedLink"
                element={<ReaderViewWrapper items={memoizedFeedItems} />}
              />
            </Routes>
          </Suspense>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;