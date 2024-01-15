import React from 'react';
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import './FeedCardLoader.css';

const ShimmerSkeleton = ({ style }) => (
  <div className="shimmer-skeleton" style={style}></div>
);

const FeedCardLoader = () => {
  const skeletonStyle = { height: '20px', marginTop: '10px' };

  return (
    <div className="card-wrapper">
      <SlCard className="card">
        <div className="image-container shimmer-skeleton"></div>
        <div className='card-bg'>
          <ShimmerSkeleton />
        </div>
        <div className="text-content">
          <ShimmerSkeleton style={{ height: '20px', width: '50%' }} />
          {Array(6).fill().map((_, i) => <ShimmerSkeleton key={i} style={skeletonStyle} />)}
        </div>
      </SlCard>
    </div>
  );
};

export default FeedCardLoader;