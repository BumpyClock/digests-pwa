// FeedCardLoader.js

import React from 'react';
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import SlSkeleton from "@shoelace-style/shoelace/dist/react/skeleton";
import './FeedCardLoader.css';

const FeedCardLoader = ({ id }) => {
  return (
    <div className="card-wrapper">
      <SlCard className="card" id={id}>
        {/* Image Placeholder */}
        <div className='image-skeleton'>
        
          <SlSkeleton className="image-skeleton" effect="pulse" />
          
        </div>

        {/* Text Content Placeholders */}
        <div className="text-content">
          <SlSkeleton className="title-skeleton" width="60%" height="20px" effect="pulse" />
          <SlSkeleton className="date-skeleton" width="40%" height="14px" effect="pulse" />
          {[1, 2, 3].map((item) => (
            <SlSkeleton key={item} className="description-skeleton" width="100%" height="14px" effect="pulse" />
          ))}
        </div>
      </SlCard>
    </div>
  );
};

export default React.memo(FeedCardLoader);
