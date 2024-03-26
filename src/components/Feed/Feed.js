import React, { useState, useEffect, useCallback,useRef,memo } from 'react';
import FeedCard from '../FeedCard/FeedCard.js';
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { debounce } from 'lodash';

const MemoizedFeedCard = memo(FeedCard);

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
  const [isLoading, setIsLoading] = useState(true); // New state variable

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
      setIsLoading(false); // Set loading to false once data is fetched
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
    const scrollPosition = window.pageYOffset;
    const windowSize     = window.innerHeight;
    const bodyHeight     = document.body.offsetHeight;

    // Calculate the scroll percentage
    const scrollPercentage = (scrollPosition / (bodyHeight - windowSize)) * 100;

    if (scrollPercentage >= 50) {
      fetchMoreData();
    }
  }, 100);

  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}, [fetchMoreData]);

return (
  isLoading ? <div>Loading...</div> : // Return loading indicator if isLoading is true
  <ResponsiveMasonry
    columnsCountBreakPoints={{320: 1, 550: 2, 850: 3, 1201: 4,1601:5,1901:6,2201:7}}
  >
    <Masonry gutter={gutterSize}>
      {items.map((item) => (
        <div key={item.id}>
          <MemoizedFeedCard item={item} />
        </div>
      ))}
    </Masonry>
  </ResponsiveMasonry>
);
};

export default Feed;