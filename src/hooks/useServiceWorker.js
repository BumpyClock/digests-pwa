// src/hooks/useServiceWorker.js
import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import useAppStore from '../data/store';

/**
 * Custom hook for interacting with the service worker.
 * @returns {Object} - An object containing the loading state, error state, and functions to interact with the service worker.
 */
const useServiceWorker = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();
  const { feedUrls, refreshInterval } = useAppStore();
  const isFetchingRef = useRef(false); // Ref to track fetching status

  const { refetch, data } = useQuery(
    ['rssData', feedUrls],
    () => {
      console.log('useQuery called', {
        isFetching: isFetchingRef.current,
        feedUrls,
      }); // Log when useQuery is called

      if (isFetchingRef.current) {
        console.log('Already fetching, rejecting');
        return Promise.reject('Already fetching'); // Prevent concurrent fetches
      }

      isFetchingRef.current = true; // Set fetching status
      setIsLoading(true);

      return new Promise((resolve, reject) => {
        if (!navigator.serviceWorker.controller) {
          isFetchingRef.current = false;
          setIsLoading(false);
          reject(new Error('Service worker not active yet'));
          return;
        }

        const messageChannel = new MessageChannel();

        messageChannel.port1.onmessage = (event) => {
          isFetchingRef.current = false; // Reset fetching status
          setIsLoading(false);
          console.log('Message received from service worker', event.data); // Log received data

          if (event.data && event.data.type === 'RSS_DATA') {
            console.log('Resolving with data:', event.data.payload);
            resolve(event.data.payload);
          } else {
            const errorMessage =
              event.data?.error || 'Failed to fetch RSS data';
            console.error(errorMessage);
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
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      onError: (err) => {
        console.error('useQuery error:', err);
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
      navigator.serviceWorker.addEventListener(
        'message',
        handleServiceWorkerError
      );
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: 'CLIENT_READY' });
        }
      });
    }

    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener(
          'message',
          handleServiceWorkerError
        );
      }
    };
  }, []);

  return { isLoading, error, refetch, data };
};

export default useServiceWorker;