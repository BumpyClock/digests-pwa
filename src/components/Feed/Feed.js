import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import FeedCard from '../FeedCard/FeedCard.js';
import PodcastCard from '../PodcastCard/PodcastCard.js'; // Import PodcastCard
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { debounce } from 'lodash';

const MemoizedFeedCard = memo(FeedCard);
const MemoizedPodcastCard = memo(PodcastCard); // Memoize PodcastCard for optimization

const useEventListener = (eventName, handler, element = window) => {
  const savedHandler = useRef();

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const isSupported = element && element.addEventListener;
    if (!isSupported) return;

    const eventListener = event => savedHandler.current(event);
    element.addEventListener(eventName, eventListener);

    return () => {
      element.removeEventListener(eventName, eventListener);
    };
  }, [eventName, element]);
};

const Feed = ({ feedItems, feedDetails }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const feedRef = useRef();

  const getGutterSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 650) {
      return '12px';
    } else if (width <= 1050) {
      return '24px';
    } else if (width <= 1250) {
      return '36px';
    } else {
      return '36px';
    }
  }, []);

  const getStepSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 350) {
      return 4;
    } else if (width <= 750) {
      return 8;
    } else if (width <= 900) {
      return 12;
    } else if (width <= 1200) {
      return 16;
    } else if (width <= 1900) {
      return 20;
    } else {
      return 25;
    }
  }, []);

  const [gutterSize, setGutterSize] = useState(getGutterSize());
  const [stepSize, setStepSize] = useState(getStepSize());

  const debouncedSetStepSize = debounce(setStepSize, 300);
  const debouncedSetGutterSize = debounce(setGutterSize, 300);

  const handleResize = useCallback(() => {
    debouncedSetStepSize(getStepSize());
    debouncedSetGutterSize(getGutterSize());
  }, [debouncedSetStepSize, debouncedSetGutterSize, getStepSize, getGutterSize]);

  useEventListener('resize', handleResize);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    if (feedItems.length > 0) {
      const newItems = feedItems.slice(0, stepSize);
      setItems(newItems);
      setHasMore(feedItems.length > newItems.length);
      setIsLoading(false);
    }
  }, [feedItems, stepSize]);

  const fetchMoreData = useCallback(() => {
    if (!hasMore || items.length >= feedItems.length) {
      setHasMore(false);
      return;
    }

    const newItems = feedItems.slice(items.length, items.length + stepSize);
    if (newItems.length === 0 || (newItems.length === 1 && newItems[0] === items[items.length - 1])) {
      setHasMore(false);
      return;
    }

    setItems(prevItems => [...prevItems, ...newItems]);
  }, [items, feedItems, stepSize, hasMore]);

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (!feedRef.current) {
        return;
      }

      const scrollPosition = feedRef.current.scrollTop;
      const divSize = feedRef.current.clientHeight;
      const divScrollHeight = feedRef.current.scrollHeight;

      const scrollPercentage = (scrollPosition / (divScrollHeight - divSize)) * 100;

      if (scrollPercentage >= 40) {
        fetchMoreData();
      }
    }, 100);

    const currentFeedRef = feedRef.current;

    if (currentFeedRef) {
      currentFeedRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentFeedRef) {
        currentFeedRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, [fetchMoreData]);

  return isLoading ? (
    <div className="loading-indicator">Loading...</div>
  ) : (
    <div className="feed" ref={feedRef}>
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 320: 1, 550: 2, 850: 3, 1201: 4, 1601: 4, 1801: 4, 1901: 5, 2201: 6 }}
        style={{ maxWidth: '2400px', margin: '0 auto' }}
      >
        <Masonry gutter={gutterSize}>
          {items.map((item) => (
            <div key={item.id}>
              {item.type === 'podcast' ? (
                <MemoizedPodcastCard item={item} /> // Render PodcastCard for podcasts
              ) : (
                <MemoizedFeedCard item={item} /> // Render FeedCard for other types
              )}
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default Feed;
