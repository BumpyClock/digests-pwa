import React, { useState, useEffect, useCallback } from 'react';
import FeedCard from '../FeedCard/FeedCard.js';
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { debounce } from 'lodash';

const MemoizedFeedCard = React.memo(FeedCard);

const getStepSize = () => {
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
};

const Feed = ({ feedItems, feedDetails }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [stepSize, setStepSize] = useState(getStepSize());

  const handleResize = useCallback(debounce(() => {
    setStepSize(getStepSize());
  }, 300), []);

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
    }
  }, [feedItems, stepSize]);

  const fetchMoreData = useCallback(() => {
    if (items.length >= feedItems.length) {
      setHasMore(false);
      return;
    }

    const newItems = feedItems.slice(items.length, items.length + stepSize);
    if (newItems.length === 0 || (newItems.length === 1 && newItems[0] === items[items.length - 1])) {
      setHasMore(false);
      return;
    }

    setItems(prevItems => [...prevItems, ...newItems]);
  }, [items, feedItems, stepSize]);

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
    <ResponsiveMasonry
      columnsCountBreakPoints={{350: 1, 750: 2, 900: 3,1201:4,1901:5,2201:6}}
    >
      <Masonry gutter="24px">
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