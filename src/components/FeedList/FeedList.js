import React from "react";
import "./FeedList.css";
import Slbutton from "@shoelace-style/shoelace/dist/react/button";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

const FeedList = ({ feeds, onRemoveFeed }) => {
  const gutterSize = "12px"; // Define the gutter size

  return (
    <div className="feed-list">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 450:1, 550: 1, 650:2,  1200: 2  }}
        style={{ margin: '24px 24px' }}

      >
        <Masonry gutter={gutterSize}>
          {feeds.map((feed, index) => (
            <SlCard className="feed-card">
            <div className="feed-card-content" key={index}>
              <div className="feed-card-header">
                <img
                  src={feed.favicon}
                  alt={`${feed.feedTitle} icon`}
                  className="feed-icon"
                />
                <div className="feed-info">
                  <h3 className="feed-title">{feed.siteTitle}</h3>
                  <div className="feed-url">
                  <a href={feed.url} target="_blank" rel="noopener noreferrer" className="feed-url">
                    {feed.feedUrl}
                  </a>
                  </div>
                  
                </div>
              </div>
              <div className="feed-description">
                <p>{feed.description}</p>
              </div>
              <div className="feed-stats">
               
              </div>
              <div className="feed-actions">
                    <Slbutton onClick={()=> onRemoveFeed(feed.feedUrl)}>Remove feed</Slbutton>
                  </div>
            </div>
            </SlCard>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default FeedList;