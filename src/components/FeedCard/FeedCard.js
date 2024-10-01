import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import WebsiteInfo from "../website-info/website-info.js";
import "./FeedCard.css";
import FeedCardLoader from "../FeedCardLoader/FeedCardLoader.js";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import DropShadow from "../DropShadow/DropShadow.js";
import ReaderView from "../ReaderView/ReaderView.js";
import SlRelativeTime from "@shoelace-style/shoelace/dist/react/relative-time";

function decodeHtmlEntities(text) {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

const useImageLoader = (src) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadedImage, setLoadedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (src) {
      const img = new Image();
      img.src = src;

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = img.src;
      document.head.appendChild(link);

      const onLoad = () => {
        if (isMounted) {
          if (img.width === 1 && img.height === 1) {
            setIsLoaded(true);
            setIsError(true);
          } else {
            setIsLoaded(true);
            setLoadedImage(img);
          }
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
        document.head.removeChild(link);
      };
    } else {
      setIsLoaded(true);
      setIsError(true);
    }
  }, [src]);

  return { isLoaded, isError, loadedImage };
};

const FeedCard = ({ item, apiUrl , openAIKey}) => {
  const [hover, setHover] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [showReaderView, setShowReaderView] = useState(false);

  const { isLoaded, isError, loadedImage } = useImageLoader(item.thumbnail);

  const elevation = useMemo(() => {
    if (mouseDown) return 8;
    if (hover) return 32;
    return 16;
  }, [mouseDown, hover]);

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
      onClick={() => {
        if (!showReaderView) {
          setTimeout(() => {
            if (!showReaderView) {
              setShowReaderView(true);
            }
          }, 500);
        }
      }}
    >
      <div className="card-wrapper">
      <DropShadow
        color={item.thumbnailColor || { r: 0, g: 0, b: 0 }}
        elevation={elevation}
      />

      <SlCard
        className="card"
        layoutId={`card-${item.id}`}
        id={item.id}
        style={{
          opacity: showReaderView ? 1 : 1, // Keep the original item visible
        }}
      >
        <div className="card-bg">
          <div className="noise"></div>
          {loadedImage && (
            <img src={loadedImage.src} alt={item.siteTitle} />
          )}
        </div>
        {!isLoaded && (
          <SlAnimation name="pulse" duration={250} repeat>
            <FeedCardLoader />
          </SlAnimation>
        )}

        {loadedImage && !isError && (
          <>
            <motion.div layoutId={`image-${item.id}`}>
              <div className="image-container">
                <img
                  src={loadedImage.src}
                  alt={item.siteTitle}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
            </motion.div>
          </>
        )}

        <div
          className="text-content"
          style={{ padding: isError ? "" : "12px 24px" }}
        >
          <WebsiteInfo
            favicon={item.favicon}
            siteTitle={item.siteTitle}
            feedTitle={item.siteTitle}
          />
          <h3>{decodeHtmlEntities(item.title)}</h3>
          <div className="date">
            <SlRelativeTime date={new Date(item.published)} />
          </div>
          {item.description ? (
            <p className="description">{item.description}</p>
          ) : (
            <p className="description">{item.content}</p>
          )}
        </div>
      </SlCard>
      </div>
      <AnimatePresence>
        {showReaderView && (
          <ReaderView
            url={item.link}
            item={item}
            apiUrl={apiUrl}
            openAIKey={openAIKey}
            onClose={() => {
              setShowReaderView(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(FeedCard);