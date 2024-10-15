// Feed.js

import React, { useState, useEffect, useCallback, memo, useMemo, useRef, Suspense } from 'react';
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { debounce } from 'lodash';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar.js';

// Lazy load FeedCard and PodcastCard for performance
const FeedCard = React.lazy(() => import('../FeedCard/FeedCard.js'));
const PodcastCard = React.lazy(() => import('../PodcastCard/PodcastCard.js'));

// Memoize the FeedCard and PodcastCard to prevent unnecessary re-renders
const MemoizedFeedCard = memo(FeedCard);
const MemoizedPodcastCard = memo(PodcastCard);

const Feed = ({ feedItems, apiUrl, filterType, openAIKey }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const itemsRef = useRef([]); // Holds existing items without causing re-renders
  const [isReaderViewOpen, setIsReaderViewOpen] = useState(false); // Tracks ReaderView state

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

  // Memoize filtered feed items based on filterType
  const filteredFeedItems = useMemo(() => {
    if (filterType === 'podcast') {
      return feedItems.filter(item => item.type === 'podcast');
    } else if (filterType === 'rss') {
      return feedItems.filter(item => item.type === 'rss' || item.type === 'article');
    } else {
      return feedItems;
    }
  }, [feedItems, filterType]);

  // Fetch initial set of items when filterType or feedItems change
  useEffect(() => {
    if (!isReaderViewOpen) {
      const initialItems = filteredFeedItems.slice(0, itemsPerPage);
      setItems(initialItems);
      itemsRef.current = initialItems; // Update ref
      setHasMore(filteredFeedItems.length > itemsPerPage);
      setIsLoading(false);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0; // Reset scroll position
      }
    }
  }, [filterType, filteredFeedItems, isReaderViewOpen, itemsPerPage]);

  // Function to fetch more data
  const fetchMoreData = useCallback(() => {
    if (hasMore && !isLoading && !isReaderViewOpen) {
      setIsLoading(true);
      console.log('Fetching more data...');
      setTimeout(() => {
        const currentLength = itemsRef.current.length;
        const moreItems = filteredFeedItems.slice(currentLength, currentLength + itemsPerPage);
        if (moreItems.length > 0) {
          const updatedItems = [...itemsRef.current, ...moreItems];
          itemsRef.current = updatedItems; // Update ref
          setItems(updatedItems); // Trigger UI update
          setHasMore(filteredFeedItems.length > currentLength + itemsPerPage);
          setIsLoading(false);
          console.log('Fetched more data.');
        } else {
          setIsLoading(false);
        }
      }, 500); // Simulated network delay
    }
  }, [hasMore, isLoading, filteredFeedItems, isReaderViewOpen, itemsPerPage]);

  // Debounced scroll handler to prevent rapid function calls
  const debouncedHandleScrollFrame = useMemo(() => debounce((values) => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage >= 60 && hasMore && !isLoading && !isReaderViewOpen) {
      console.log('Scroll reached 60%, fetching more data...');
      fetchMoreData();
    }
  }, 200), [fetchMoreData, hasMore, isLoading, isReaderViewOpen]);

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

  const visibleItems = useMemo(() => items, [items]); // Memoize to prevent unnecessary computations

  return isLoading && items.length === 0 ? (
    <div className="loading-indicator">Loading...</div>
  ) : items.length === 0 ? (
    <div className="no-items-indicator">No items to display.</div>
  ) : (
    <CustomScrollbar onScrollFrame={handleScrollFrame} ref={scrollRef}>
      <div className="feed">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 320: 1, 650: 2, 1050: 3, 1500: 4, 1700: 5, 2000: 6, 2500: 7, 3000: 8 }}
        >
          <Masonry gutter={gutterSize}>
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
          </Masonry>
        </ResponsiveMasonry>
        {isLoading && hasMore && (
          <div className="loading-more-indicator">Loading more items...</div>
        )}
      </div>
    </CustomScrollbar>
  );
};

export default Feed;
