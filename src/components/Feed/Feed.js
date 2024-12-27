// Feed.js

import React, { useState, useEffect, useCallback, memo, useMemo, useRef, Suspense } from 'react';
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { debounce } from 'lodash';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar.js';
import { useQuery } from 'react-query';

// Lazy load FeedCard and PodcastCard
const FeedCard = React.lazy(() => import('../FeedCard/FeedCard.js'));
const PodcastCard = React.lazy(() => import('../PodcastCard/PodcastCard.js'));

// Memoized components
const MemoizedFeedCard = memo(FeedCard);
const MemoizedPodcastCard = memo(PodcastCard);
const MemoizedMasonry = memo(Masonry);

const Feed = ({ feedItems, apiUrl, filterType, openAIKey }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const itemsRef = useRef([]);
  const [isReaderViewOpen, setIsReaderViewOpen] = useState(false);
  const [allowFetchMore, setAllowFetchMore] = useState(false); // Control when fetching more is allowed
  const [initialLoadComplete, setInitialLoadComplete] = useState(false); // Track initial load

  const itemsPerPage = 20;
  const scrollRef = useRef(null);

  // Function to calculate gutter size based on window width
  const getGutterSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 650) return '12px';
    else if (width <= 1050) return '28px';
    else return '36px';
  }, []);

  const [gutterSize, setGutterSize] = useState(getGutterSize());

  // Debounce gutter size updates to optimize performance
  const debouncedSetGutterSize = useMemo(() => debounce(setGutterSize, 300), [setGutterSize]);

  const handleResize = useCallback(() => {
    debouncedSetGutterSize(getGutterSize());
  }, [debouncedSetGutterSize, getGutterSize]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedSetGutterSize.cancel(); // Clean up debounce on unmount
    };
  }, [handleResize, debouncedSetGutterSize]);

  // Memoized filtered feed items
  const filteredFeedItems = useMemo(() => {
    if (filterType === 'podcast') {
      return feedItems.filter(item => item.type === 'podcast');
    } else if (filterType === 'rss') {
      return feedItems.filter(item => item.type === 'rss' || item.type === 'article');
    } else {
      return feedItems;
    }
  }, [feedItems, filterType]);

  // Fetch initial set of items
  useEffect(() => {
    if (!isReaderViewOpen) {
      const initialItems = filteredFeedItems.slice(0, itemsPerPage);
      setItems(initialItems);
      itemsRef.current = initialItems;
      setHasMore(filteredFeedItems.length > itemsPerPage);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }

      // Delay enabling fetchMore and initial load complete
      const timer = setTimeout(() => {
        setAllowFetchMore(true);
        setInitialLoadComplete(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filterType, filteredFeedItems, isReaderViewOpen]);

  // useQuery for fetching more data
  const { isFetching: isFetchingMore } = useQuery(
    ['feedItems', itemsRef.current.length, filterType],
    () => {
      console.log('Fetching more data...');
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentLength = itemsRef.current.length;
          const moreItems = filteredFeedItems.slice(currentLength, currentLength + itemsPerPage);
          if (moreItems.length > 0) {
            const updatedItems = [...itemsRef.current, ...moreItems];
            itemsRef.current = updatedItems;
            resolve(updatedItems);
          } else {
            resolve(itemsRef.current);
          }
        }, 500);
      });
    },
    {
      enabled: hasMore && !isReaderViewOpen && allowFetchMore, // Fetch more only when allowed
      keepPreviousData: true,
      onSuccess: (data) => {
        setItems(data);
        // Assuming your data source can tell you the total number of items:
        // setHasMore(data.totalItems > data.length); // Replace 'totalItems' with the correct property
        setHasMore(filteredFeedItems.length > data.length); // Fallback if totalItems is not available
        console.log('Fetched more data.');
      },
      onError: (error) => {
        console.error('Error fetching more data:', error);
      },
    }
  );

  // Debounced scroll handler
  const debouncedHandleScrollFrame = useMemo(() => debounce((values) => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage >= 60 && hasMore && !isFetchingMore && !isReaderViewOpen) {
      console.log('Scroll reached 60%, triggering fetchMoreData...');
    }
  }, 200), [hasMore, isFetchingMore, isReaderViewOpen]);

  const handleScrollFrame = useCallback((values) => {
    debouncedHandleScrollFrame(values);
  }, [debouncedHandleScrollFrame]);

  // Memoized handlers for ReaderView
  const handleReaderViewOpen = useCallback(() => {
    setIsReaderViewOpen(true);
  }, []);

  const handleReaderViewClose = useCallback(() => {
    setIsReaderViewOpen(false);
  }, []);

  const visibleItems = useMemo(() => items, [items]);

  return items.length === 0 ? (
    <div className="no-items-indicator">No items to display.</div>
  ) : (
    <>
      {initialLoadComplete && (
        <CustomScrollbar onScrollFrame={handleScrollFrame} ref={scrollRef}>
          <div className="feed">
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 320: 1, 650: 2, 1050: 3, 1500: 4, 1700: 5, 2000: 6, 2500: 7, 3000: 8 }}
            >
              <MemoizedMasonry gutter={gutterSize}>
                {visibleItems.map((item) => (
                  <Suspense fallback={<div className="loading-card">Loading...</div>} key={item.id}>
                    {item.type === 'podcast' ? (
                      <MemoizedPodcastCard
                        item={item}
                        apiUrl={apiUrl}
                        openAIKey={openAIKey}
                        onReaderViewOpen={handleReaderViewOpen}
                        onReaderViewClose={handleReaderViewClose}
                      />
                    ) : (
                      <MemoizedFeedCard
                        item={item}
                        apiUrl={apiUrl}
                        openAIKey={openAIKey}
                        onReaderViewOpen={handleReaderViewOpen}
                        onReaderViewClose={handleReaderViewClose}
                      />
                    )}
                  </Suspense>
                ))}
              </MemoizedMasonry>
            </ResponsiveMasonry>
            {isFetchingMore && hasMore && (
              <div className="loading-more-indicator">Loading more items...</div>
            )}
          </div>
        </CustomScrollbar>
      )}
    </>
  );
};

export default Feed;