import React from 'react';
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import './FeedCardLoader.css';

const FeedCardLoader = () => {
    return (
        <div className="card-wrapper">
            <SlCard className="card">
                <div className="image-container shimmer-skeleton"></div>
                <div className='card-bg'>
                    <div className='shimmer-skeleton'></div>
                </div>
                <div className="text-content">
                    <div className="shimmer-skeleton" style={{ height: '20px', width: '50%' }}></div>
                    <div className="shimmer-skeleton" style={{ height: '20px', marginTop: '10px' }}></div>
                    <div className="shimmer-skeleton" style={{ height: '20px', marginTop: '10px' }}></div>
                    <div className="shimmer-skeleton" style={{ height: '20px', marginTop: '10px' }}></div>
                    <div className="shimmer-skeleton" style={{ height: '20px', marginTop: '10px' }}></div>
                    <div className="shimmer-skeleton" style={{ height: '20px', marginTop: '10px' }}></div>
                </div>
            </SlCard>
        </div>
    );
};

export default FeedCardLoader;