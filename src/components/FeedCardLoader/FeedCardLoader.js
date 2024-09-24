import React from 'react';
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import SlSkeleton from "@shoelace-style/shoelace/dist/react/skeleton";
import './FeedCardLoader.css';

const FeedCardLoader = ({ id }) => {
  const skeletonStyle = { height: '20px', marginTop: '10px' };

  return (
    <div className="card-wrapper">
      <SlCard className="card" id={id}>
        <SlSkeleton className="image-container" effect="pulse" />
        <div className='card-bg'>
          <SlSkeleton effect="pulse" />
        </div>
        <div className="text-content">
          <SlSkeleton style={{ height: '20px', width: '50%' }} effect="pulse" />
          {Array(6).fill().map((_, i) => <SlSkeleton key={i} style={skeletonStyle} effect="pulse" />)}
        </div>
      </SlCard>
    </div>
  );
};

export default FeedCardLoader;