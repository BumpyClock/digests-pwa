// Feed.js

import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import FeedCard from '../FeedCard/FeedCard.js';
import PodcastCard from '../PodcastCard/PodcastCard.js';
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { debounce } from 'lodash';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar.js';

const MemoizedFeedCard = memo(FeedCard);
const MemoizedPodcastCard = memo(PodcastCard);

const Feed = ({ feedItems, apiUrl, filterType, openAIKey }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Define itemsPerPage outside of state
  const itemsPerPage = 20;

  const scrollRef = useRef(null);

  // Function to calculate gutter size
  const getGutterSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 650) return '12px';
    else if (width <= 1050) return '28px';
    else return '36px';
  }, []);

  const [gutterSize, setGutterSize] = useState(getGutterSize());

  // Debounce the gutter size update to optimize performance
  const debouncedSetGutterSize = useMemo(() => debounce(setGutterSize, 300), [setGutterSize]);

  const handleResize = useCallback(() => {
    debouncedSetGutterSize(getGutterSize());
  }, [debouncedSetGutterSize, getGutterSize]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedSetGutterSize.cancel(); // Cancel any pending debounced calls on unmount
    };
  }, [handleResize, debouncedSetGutterSize]);

  // Memoize the filtered feed items based on filterType
  const filteredFeedItems = useMemo(() => {
    if (filterType === 'podcast') {
      return feedItems.filter(item => item.type === 'podcast');
    } else if (filterType === 'rss') {
      return feedItems.filter(item => item.type === 'rss' || item.type === 'article');
    } else {
      return feedItems;
    }
  }, [feedItems, filterType]);

  useEffect(() => {
    // Initialize items with the first set
    const initialItems = filteredFeedItems.slice(0, itemsPerPage);
    setItems(initialItems);
    setHasMore(filteredFeedItems.length > itemsPerPage);
    setIsLoading(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [filterType, filteredFeedItems]);

  const fetchMoreData = useCallback(() => {
    if (hasMore && !isLoading) {
      setIsLoading(true);
      console.log('Fetching more data...');
      setTimeout(() => {
        const currentLength = items.length;
        const moreItems = filteredFeedItems.slice(currentLength, currentLength + itemsPerPage);
        setItems(prevItems => [...prevItems, ...moreItems]);
        setHasMore(filteredFeedItems.length > currentLength + itemsPerPage);
        setIsLoading(false);
        console.log('Fetched more data.');
      }, 500); // Simulate network delay
    }
  }, [hasMore, isLoading, items.length, filteredFeedItems]);

  const handleScrollFrame = useCallback((values) => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    // Debugging logs
    // console.log(`Scroll Top: ${scrollTop}, Scroll Height: ${scrollHeight}, Client Height: ${clientHeight}, Scroll Percentage: ${scrollPercentage}`);

    if (scrollPercentage >= 80 && hasMore && !isLoading) { // Fetch more when 80% scrolled
      console.log('Scroll reached 80%, fetching more data...');
      fetchMoreData();
    }
  }, [fetchMoreData, hasMore, isLoading]);

  const visibleItems = items; // Display all loaded items

  return isLoading && items.length === 0 ? (
    <div className="loading-indicator">Loading...</div>
  ) : items.length === 0 ? (
    <div className="no-items-indicator">No items to display.</div>
  ) : (
    <CustomScrollbar onScrollFrame={handleScrollFrame} ref={scrollRef}>
      <div className="feed">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 320:1, 650: 2, 1050: 3, 1500: 4, 1700:5, 2000:6,2500:7,3000:8 }}
        >
          <Masonry gutter={gutterSize}>
            {visibleItems.map((item) => {
              if (item.type === 'podcast') {
                return (
                  <MemoizedPodcastCard
                    key={item.id}
                    item={item}
                    apiUrl={apiUrl}
                    openAIKey={openAIKey}
                  />
                );
              } else {
                return (
                  <MemoizedFeedCard
                    key={item.id}
                    item={item}
                    apiUrl={apiUrl}
                    openAIKey={openAIKey}
                  />
                );
              }
            })}
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
