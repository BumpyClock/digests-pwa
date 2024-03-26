import React, { useState, useEffect, useMemo } from "react";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import WebsiteInfo from "../website-info/website-info.js";
import "./FeedCard.css";
import FeedCardLoader from "../FeedCardLoader/FeedCardLoader.js";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import DropShadow from "../DropShadow/DropShadow.js"; // Import DropShadow
import ReaderView from "../ReaderView/ReaderView.js";
import SlRelativeTime from "@shoelace-style/shoelace/dist/react/relative-time";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import "react-lazy-load-image-component/src/effects/opacity.css";


const useImageLoader = (src) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadedImage, setLoadedImage] = useState(null);

  useEffect(() => {
  let isMounted = true;

  if (src) {
    const img = new Image();
    img.src = src;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);

    const onLoad = () => {
      if (isMounted) {
        setIsLoaded(true);
        setLoadedImage(img);
      }
    };

    const onError = () => {
      if (isMounted) {
        setIsLoaded(true);
        setIsError(true);
        console.error("Error loading image", src);
      }
    };

    img.onload = onLoad;
    img.onerror = onError;

    return () => {
      isMounted = false;
      img.onload = null;
      img.onerror = null;
      document.head.removeChild(link); // Clean up the preload link
    };
  } else {
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

  const elevation = useMemo(() => {
    if (mouseDown) return 8;
    if (hover) return 32;
    return 16;
  }, [mouseDown, hover]);

  const thumbnailUrl = useMemo(() => {
    if (Array.isArray(item.thumbnail)) {
      return item.thumbnail.find((thumbnail) => thumbnail.url || thumbnail.link)?.url;
    }
    return item.thumbnail || null;
  }, [item.thumbnail]);

  if (!isLoaded) {
    return <FeedCardLoader id={item.id} />;
  }

  return (
  <div
    style={{ position: "relative" }}
    onMouseEnter={() => setHover(true)}
    onMouseLeave={() => {
      setHover(false);
      setMouseDown(false);
    }}
    onMouseDown={() => setMouseDown(true)}
    onMouseUp={() => setMouseDown(false)}
    onClick={() => setShowReaderView(!showReaderView)}
  >
    <DropShadow color={item.thumbnailColor || { r: 0, g: 0, b: 0 }} elevation={elevation} />
    <SlCard
      className="card"
      id={item.id}
      style={{
        opacity: isLoaded ? 1 : 0,
        transition: "opacity 0.125s",
        border: `1px solid ${item.thumbnailColor}`,
      }}
    >
      {loadedImage && !isError && (
        <>
          <div className="image-container">
            <LazyLoadImage
              src={loadedImage.src}
              alt={item.siteTitle}
              effect="opacity"
              placeholder={<div style={{ height: "180px", width: "100%" }} />}
              threshold={600}
              width="100%" // Set the width
              height="100%" // Set the height
            />
          </div>
          <div className="card-bg">
            <LazyLoadImage
              src={loadedImage.src}
              alt={item.siteTitle}
              effect="opacity"
              placeholder={<div style={{ height: "180px", width: "100%" }} />}
              threshold={600}
              width="100%" // Set the width
              height="100%" // Set the height
            />
            <div className="noise"></div>
          </div>
        </>
      )}
      <div className="text-content" style={{ padding: isError ? "" : "12px 24px" }}>
        <WebsiteInfo favicon={item.favicon} siteTitle={item.siteTitle} feedTitle={item.feedTitle} />
        <h3>{item.title}</h3>
        <div className="date">
          <SlRelativeTime date={new Date(item.published)} />
        </div>
        {item.content && <p className="description">{item.content}</p>}
        {!thumbnailUrl && item.description && (
          <div className="description long-description">{item.description}</div>
        )}
        {item.link && (
          <a href={item.link} target="_blank" rel="noopener noreferrer">
            Read more
          </a>
        )}
      </div>
    </SlCard>
    {showReaderView && <ReaderView url={item.link} item={item} onClose={() => setShowReaderView(false)} />}
  </div>
);
};

export default React.memo(FeedCard);
