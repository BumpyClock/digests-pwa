import React, { useState, useEffect } from 'react';
import FeedCard from '../FeedCard/FeedCard.js';
import './Feed.css';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import InfiniteScroll from 'react-infinite-scroller';

const Feed = ({ feedItems, feedDetails }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (feedItems.length > 0) {
      setItems(feedItems.slice(0, 20));
      setHasMore(feedItems.length > 20);
    }
  }, [feedItems]);

  const fetchMoreData = () => {
    if (items.length >= feedItems.length) {
      setHasMore(false);
      return;
    }
    setTimeout(() => {
      setItems(items.concat(feedItems.slice(items.length, items.length + 20)));
    }, 500);
  };

  return (
    <InfiniteScroll
    pageStart={0}
    loadMore={fetchMoreData}
    hasMore={hasMore}
    loader={<div className="loader" key={0}>Loading ...</div>}
  >
    <ResponsiveMasonry
      columnsCountBreakPoints={{350: 1, 750: 2, 900: 3,1201:4,1901:5,2201:6}}
    >
     
        <Masonry gutter="12px">
          {items.map((item) => (
            <div key={item.id}>
              <FeedCard item={item} />
            </div>
          ))}
        </Masonry>
    </ResponsiveMasonry>
    </InfiniteScroll>

  );
};

export default Feed;