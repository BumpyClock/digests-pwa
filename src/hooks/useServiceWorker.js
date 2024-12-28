import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import useAppStore from '../data/store';

/**
 * Custom hook for interacting with the service worker.
 * @param {number} refreshInterval - The interval for refreshing RSS data.
 * @returns {Object} - An object containing the loading state, error state, and functions to interact with the service worker.
 */
const useServiceWorker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { feedUrls, refreshInterval } = useAppStore();

  const { refetch, data } = useQuery(
    ['rssData', feedUrls], // Include feedUrls in the query key
    () => {
      return new Promise((resolve, reject) => {
        if (!navigator.serviceWorker.controller) {
          reject(new Error('Service worker not active yet'));
          return;
        }

        setIsLoading(true);
        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          setIsLoading(false);
          if (event.data && event.data.type === 'RSS_DATA') {
            resolve(event.data.payload);
          } else {
            const errorMessage = event.data?.error || 'Failed to fetch RSS data';
            reject(new Error(errorMessage));
          }
        };

        navigator.serviceWorker.controller.postMessage(
          {
            type: 'FETCH_RSS',
            payload: { urls: feedUrls },
          },
          [messageChannel.port2]
        );
      });
    },
    {
      staleTime: 5 * 60 * 1000,
      refetchInterval: refreshInterval * 60 * 1000,
      refetchIntervalInBackground: true,
      enabled: feedUrls.length > 0,
      onError: (err) => {
        setError(err);
      },
    }
  );

  useEffect(() => {
    const handleServiceWorkerError = (event) => {
      console.error('Error from service worker:', event.data);
      setError(new Error('An error occurred with the service worker.'));
    };

    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerError);
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: 'CLIENT_READY' });
        }
      });
    }

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerError);
      }
    };
  }, []);

  return { isLoading, error, refetch, data };
};

export default useServiceWorker;