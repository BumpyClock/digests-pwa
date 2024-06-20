import React from 'react';
import './website-info.css';

const WebsiteInfo = ({ favicon, siteTitle, feedTitle, style }) => {
    return (
        <div className="website-info" style={style}>
            {favicon && <img src={favicon} alt={`${siteTitle} Favicon`} className="site-favicon" />}
            <p className='site-name'>{siteTitle || feedTitle}</p>
        </div>
    );
};

export default WebsiteInfo;