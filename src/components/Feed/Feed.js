import React, { useState, useEffect, useCallback, memo } from 'react';
import FeedCard from '../FeedCard/FeedCard.js';
import PodcastCard from '../PodcastCard/PodcastCard.js'; // Import PodcastCard
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { debounce } from 'lodash';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar.js';

const MemoizedFeedCard = memo(FeedCard);

const Feed = ({ feedItems , apiUrl}) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const getGutterSize = useCallback(() => {
    const width = window.innerWidth;
    if (width <= 650) return '12px';
    else if (width <= 1050) return '24px';
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
    setItems(prevItems => [...prevItems, ...newItems]);
  }, [items, feedItems, stepSize, hasMore]);

  const handleScrollFrame = useCallback((values) => {
    const { scrollTop, scrollHeight, clientHeight } = values;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

    if (scrollPercentage >= 90) {
      fetchMoreData();  // Fetch more data when the user scrolls 90% of the content
    }
  }, [fetchMoreData]);

  return isLoading ? (
    <div className="loading-indicator">Loading...</div>
  ) : (
    <CustomScrollbar onScrollFrame={handleScrollFrame}>
      <div className="feed">
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 320: 1, 550: 2, 850: 3, 1201: 4, 1601: 4, 1801: 4, 1901: 5, 2201: 6 }}
          style={{ maxWidth: '2400px', margin: '0 auto' }}
        >
          <Masonry gutter={gutterSize}>
            {items.map((item) => (
              <div key={item.id}>
                {item.type === 'podcast' ? (
                  <PodcastCard item={item} apiUrl={apiUrl}/>
                ) : (
                  <MemoizedFeedCard item={item} apiUrl={apiUrl}/>
                )}
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </div>
    </CustomScrollbar>
  );
};

export default Feed;
