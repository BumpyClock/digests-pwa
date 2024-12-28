// src/components/Feed/Feed.js
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './Feed.css';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { debounce } from 'lodash';
import CustomScrollbar from '../CustomScrollbar/CustomScrollbar.js';
import { useQuery, useQueryClient } from 'react-query';

// Lazy load FeedCard and PodcastCard - these are now imported at the top
const FeedCard = React.lazy(() => import('../FeedCard/FeedCard.js'));
const PodcastCard = React.lazy(() => import('../PodcastCard/PodcastCard.js'));

// Memoized components for performance
const MemoizedFeedCard = React.memo(FeedCard);
const MemoizedPodcastCard = React.memo(PodcastCard);
const MemoizedMasonry = React.memo(Masonry);

/**
 * @component
 * @param {object} props
 * @param {object[]} props.feedItems - Array of feed item objects.
 * @param {string} props.apiUrl - Base URL for API requests.
 * @param {string} props.filterType - Type of items to filter ('all', 'podcast', 'rss').
 * @param {string} props.openAIKey - OpenAI API key for AI features.
 * @description Renders a feed of articles or podcast cards with infinite scrolling.
 */
const Feed = ({ feedItems, apiUrl, filterType, openAIKey }) => {
  console.log('Feed component rendering', { feedItems });
  const itemsRef = useRef([]); // Ref to store items, avoiding stale closures in hooks
  const [hasMore, setHasMore] = useState(true);
  const [allowFetchMore, setAllowFetchMore] = useState(false); // Control when fetching more is allowed

  const itemsPerPage = 20;
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  // Function to calculate gutter size based on window width
  const getGutterSize = useMemo(() => {
    return () => {
      const width = window.innerWidth;
      if (width <= 650) return '12px';
      else if (width <= 1050) return '28px';
      else return '36px';
    };
  }, []);

  const [gutterSize, setGutterSize] = useState(getGutterSize());

  // Debounce gutter size updates
  const debouncedSetGutterSize = useMemo(() => debounce(setGutterSize, 300), [
    setGutterSize,
  ]);

  const handleResize = useMemo(() => {
    return () => {
      debouncedSetGutterSize(getGutterSize());
    };
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
      return feedItems.filter((item) => item.type === 'podcast');
    } else if (filterType === 'rss') {
      return feedItems.filter(
        (item) => item.type === 'rss' || item.type === 'article'
      );
    } else {
      return feedItems;
    }
  }, [feedItems, filterType]);

  // Fetch initial set of items - simplified logic
  useEffect(() => {
    itemsRef.current = filteredFeedItems.slice(0, itemsPerPage);
    setHasMore(filteredFeedItems.length > itemsPerPage);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Reset scroll on filter change
    }

    // Delay enabling fetchMore and initial load complete
    const timer = setTimeout(() => {
      setAllowFetchMore(true);
    }, 500); // Delay to prevent premature fetching
    return () => clearTimeout(timer);
  }, [filterType, filteredFeedItems]);

  // useQuery for fetching more data - simplified
  const { isFetching: isFetchingMore } = useQuery(
    ['feedItems', itemsRef.current.length, filterType], // Query key
    () => {
      console.log('Fetching more data...');
      return new Promise((resolve) => {
        setTimeout(() => {
          const currentLength = itemsRef.current.length;
          const moreItems = filteredFeedItems.slice(
            currentLength,
            currentLength + itemsPerPage
          );
          if (moreItems.length > 0) {
            itemsRef.current = [...itemsRef.current, ...moreItems];

            // Prefetch the next page
            const nextPageIndex = itemsRef.current.length;
            if (filteredFeedItems.length > nextPageIndex) {
              queryClient.prefetchQuery(
                ['feedItems', nextPageIndex, filterType],
                () => {
                  return new Promise((resolve) => {
                    setTimeout(() => {
                      const nextItems = filteredFeedItems.slice(
                        nextPageIndex,
                        nextPageIndex + itemsPerPage
                      );
                      resolve(nextItems);
                    }, 500); // Simulate network latency
                  });
                }
              );
            }

            resolve(itemsRef.current); // Resolve with updated ref
          } else {
            resolve(itemsRef.current); // No more items, resolve with current ref
          }
        }, 500);
      });
    },
    {
      enabled: hasMore && allowFetchMore, // Only fetch when allowed
      keepPreviousData: true,
      onSuccess: (data) => {
        setHasMore(filteredFeedItems.length > data.length); // Update hasMore
        console.log('Fetched more data.');
      },
      onError: (error) => {
        console.error('Error fetching more data:', error);
      },
    }
  );

  // Debounced scroll handler
  const debouncedHandleScrollFrame = useMemo(
    () =>
      debounce((values) => {
        const { scrollTop, scrollHeight, clientHeight } = values;
        const scrollPercentage =
          (scrollTop / (scrollHeight - clientHeight)) * 100;

        // Trigger fetchMore when scrolled to 60% and conditions are met
        if (scrollPercentage >= 60 && hasMore && !isFetchingMore) {
          console.log('Scroll reached 60%, triggering fetchMoreData...');
          // No need to call fetchMoreData directly, react-query will handle it
        }
      }, 200),
    [hasMore, isFetchingMore]
  );

  const handleScrollFrame = useCallback(
    (values) => {
      debouncedHandleScrollFrame(values);
    },
    [debouncedHandleScrollFrame]
  );

  const visibleItems = useMemo(() => itemsRef.current, []);

  return (
    <>
      <CustomScrollbar onScrollFrame={handleScrollFrame} ref={scrollRef}>
        <div className="feed">
          <ResponsiveMasonry
            columnsCountBreakPoints={{
              320: 1,
              650: 2,
              1050: 3,
              1500: 4,
              1700: 5,
              2000: 6,
              2500: 7,
              3000: 8,
            }}
          >
            <MemoizedMasonry gutter={gutterSize}>
              {visibleItems.length === 0 && (
                <div className="no-items-indicator">
                  No items to display.
                </div>
              )}
              {visibleItems.map((item) => (
                <React.Suspense
                  fallback={<div className="loading-card">Loading...</div>}
                  key={item.id}
                >
                  {item.type === 'podcast' ? (
                    <MemoizedPodcastCard
                      item={item}
                      apiUrl={apiUrl}
                      openAIKey={openAIKey}
                    />
                  ) : (
                    <MemoizedFeedCard
                      item={item}
                      apiUrl={apiUrl}
                      openAIKey={openAIKey}
                    />
                  )}
                </React.Suspense>
              ))}
            </MemoizedMasonry>
          </ResponsiveMasonry>
          {isFetchingMore && hasMore && (
            <div className="loading-more-indicator">
              Loading more items...
            </div>
          )}
        </div>
      </CustomScrollbar>
    </>
  );
};

export default Feed;