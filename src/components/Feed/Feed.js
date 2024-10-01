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
const Feed = ({ feedItems, apiUrl, filterType, openAIKey}) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const scrollRef = useRef(null); // Reference to the CustomScrollbar

  const getGutterSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 650) return '12px';
    else if (width <= 1050) return '28px';
    else return '36px';
  }, []);

  const getStepSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 350) return 4;
    else if (width <= 750) return 8;
    else if (width <= 900) return 12;
    else return 20;
  }, []);

  const [gutterSize, setGutterSize] = useState(getGutterSize());
  const [stepSize, setStepSize] = useState(getStepSize());

  const debouncedSetStepSize = debounce(setStepSize, 300);
  const debouncedSetGutterSize = debounce(setGutterSize, 300);

  const handleResize = useCallback(() => {
    debouncedSetStepSize(getStepSize());
    debouncedSetGutterSize(getGutterSize());
  }, [debouncedSetStepSize, debouncedSetGutterSize, getStepSize, getGutterSize]);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

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
    setItems([]);
    setHasMore(true);
    setIsLoading(true);





    if (filteredFeedItems.length > 0) {
      const newItems = filteredFeedItems.slice(0, stepSize);
      setItems(newItems);
      setHasMore(filteredFeedItems.length > newItems.length);
    } else {
      setItems([]);
      setHasMore(false);
    }
    setIsLoading(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }

  }, [filterType, filteredFeedItems, stepSize]);


  const fetchMoreData = useCallback(() => {
    setItems(prevItems => {
      const currentLength = prevItems.length;
      const totalLength = filteredFeedItems.length;

      if (currentLength >= totalLength) {
        setHasMore(false);
        return prevItems;
      }

      const newItems = filteredFeedItems.slice(currentLength, currentLength + stepSize);
      return [...prevItems, ...newItems];
    });
  }, [filteredFeedItems, stepSize]);

  const handleScrollFrame = useCallback((values) => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage >= 50 && hasMore && !isLoading) {
      fetchMoreData();
    }
  }, [fetchMoreData, hasMore, isLoading]);

  return isLoading ? (
    <div className="loading-indicator">Loading...</div>
  ) : items.length === 0 ? (
    <div className="no-items-indicator">No items to display.</div>
  ) : (
    <CustomScrollbar onScrollFrame={handleScrollFrame} ref={scrollRef}>
      <div className="feed">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 320: 1, 550: 2, 850: 3, 1201: 4, 1601: 4, 1801: 4, 1901: 5, 2201: 6 }}
          style={{ maxWidth: '2400px', margin: '0 auto' }}
        >
          <Masonry key={filterType} gutter={gutterSize}>
            {items.map((item) => (
              item.type === 'podcast' ? (
                <MemoizedPodcastCard key={'podcast' + item.id} item={item} apiUrl={apiUrl} openAIKey={openAIKey} />
              ) : (
                <MemoizedFeedCard key={'rss' + item.id} item={item} apiUrl={apiUrl} openAIKey={openAIKey} />
              )
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </CustomScrollbar>
  );
};

export default Feed;