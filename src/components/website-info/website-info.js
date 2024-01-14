import React from 'react';
import './website-info.css';

const WebsiteInfo = ({ favicon, siteTitle, feedTitle }) => {
    return (
        <div className="website-info">
            <img src={favicon} alt={`${siteTitle} Favicon`} className="site-favicon" />
            <p className='site-name'>{feedTitle || siteTitle}</p>
        </div>
    );
};

export default WebsiteInfo;