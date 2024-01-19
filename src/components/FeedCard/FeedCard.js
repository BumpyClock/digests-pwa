import React, { useState, useEffect } from "react";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import WebsiteInfo from "../website-info/website-info.js";
import "./FeedCard.css";
import FeedCardLoader from "../FeedCardLoader/FeedCardLoader.js";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import DropShadow from "../DropShadow/DropShadow.js"; // Import DropShadow
import ReaderView from "../ReaderView/ReaderView.js";



const useImageLoader = (src) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadedImage, setLoadedImage] = useState(null);

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.src = src;

      const onLoad = () => {
        setIsLoaded(true);
        setLoadedImage(img);   
      };

      const onError = () => {
        setIsLoaded(true);
        setIsError(true);
        console.error("Error loading image", src);
      };

      img.onload = onLoad;
      img.onerror = onError;

      // Check if the image is a 1x1 pixel GIF
      if (src === "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7") {
        setIsError(true);
      }

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
    else {
      setIsLoaded(true);
      setIsError(true);
    }
  }, [src]);

  return { isLoaded, isError, loadedImage };
};


const FeedCard = ({ item }) => {
  const [hover, setHover] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [showReaderView, setShowReaderView] = useState(false);
  const { isLoaded, isError, loadedImage } = useImageLoader(item.thumbnail);


  let elevation;
  if (mouseDown) {
    elevation = 8;
  } else if (hover) {
    elevation = 32;
  } else {
    elevation = 16;
  }
  let thumbnailUrl = item.thumbnail;
  if (Array.isArray(item.thumbnail)) {
    thumbnailUrl = item.thumbnail.find(
      (thumbnail) => thumbnail.url || thumbnail.link
    )?.url;
  } else if (!item.thumbnail) {
    thumbnailUrl = null;
  }

  if (!isLoaded) {
    return <FeedCardLoader id={item.id} />;
  }

  return (
    <SlAnimation name="fade-in" duration={500} play={isLoaded}>
      <div style={{ position: 'relative' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setMouseDown(false); }}
        onMouseDown={() => setMouseDown(true)}
        onMouseUp={() => setMouseDown(false)}
        onClick={() => setShowReaderView(!showReaderView)}>

<DropShadow color={item.thumbnailColor || {r: 0, g: 0, b: 0}} elevation={elevation} />        <SlCard
          className="card" id={item.id}
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s",
            border: `1px solid ${item.thumbnailColor}`
          }}
        >
          {loadedImage && !isError && (
            <div className="image-container">
              <img
                src={loadedImage.src}
                alt={item.siteTitle}
              />
            </div>
          )}
          {loadedImage && !isError && (
            <div className="card-bg">
              <img src={loadedImage.src} alt={item.siteTitle} />
              <div className="noise"></div>
            </div>
          )}
          <div className="text-content" style={{ padding: isError ? '' : '12px 24px' }}>
            <WebsiteInfo
              favicon={item.favicon}
              siteTitle={item.siteTitle}
              feedTitle={item.feedTitle}
            />
            <h3>{item.title}</h3>
            <div className="date">
              {new Date(item.published).toLocaleString()}
            </div>
            {item.content && <p className="description">{item.content}</p>}

            {!thumbnailUrl && item.description && (
              <div className="description long-description">
                {item.description}
              </div>
            )}

          </div>
        </SlCard>
      </div>
      {showReaderView && <ReaderView url={item.link} onClose={() => setShowReaderView(false)} />}
    </SlAnimation>
  );
};

export default React.memo(FeedCard);