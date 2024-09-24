import React from "react";
import "./FeedList.css";
import Slbutton from "@shoelace-style/shoelace/dist/react/button";

const FeedList = ({ feeds }) => {
  return (
    <div className="feed-list">
      {feeds.map((feed, index) => (
        <div className="feed-card" key={index}>
          <div className="feed-card-header">
            <img
              src={feed.favicon}
              alt={`${feed.feedTitle} icon`}
              className="feed-icon"
            />
            <div className="feed-info">
              <h3 className="feed-title">{feed.siteTitle}</h3>
              <a href={feed.url} target="_blank" rel="noopener noreferrer" className="feed-url">
                {feed.feedUrl}
              </a>
              <div className="feed-actions">
                
                <Slbutton >Similar Feeds</Slbutton>
              </div>
            </div>
          </div>
          <div className="feed-description">
            <p>{feed.description}</p>
            
            
          </div>
          <div className="feed-stats">
            <span>{feed.followers} followers</span>
            <span>{feed.articlesPerWeek} articles per week</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeedList;
