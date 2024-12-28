import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import WebsiteInfo from "../website-info/website-info.js";
import "./FeedCard.css";
import FeedCardLoader from "../FeedCardLoader/FeedCardLoader.js";
import DropShadow from "../DropShadow/DropShadow.js";
import ReaderView from "../ReaderView/ReaderView.js";
import SlRelativeTime from "@shoelace-style/shoelace/dist/react/relative-time";
import { useNavigate } from 'react-router-dom';

// Optimized: Create textarea element outside the component to avoid recreating it on each render
const textArea = document.createElement('textarea');

/**
 * @function decodeHtmlEntities
 * @param {string} text - The text to decode.
 * @returns {string} The decoded text.
 * @description Decodes HTML entities in a string.
 */
function decodeHtmlEntities(text) {
  textArea.innerHTML = text;
  return textArea.value;
}

/**
 * @function useImageLoader
 * @param {string} src - The image source URL.
 * @returns {object} An object containing the loading status, error status, and the loaded image.
 * @description Custom hook to load an image and track its loading status.
 */
const useImageLoader = (src) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadedImage, setLoadedImage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    if (src) {
      const img = new Image();
      img.src = src;

      // Preload the image using a link tag
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = img.src;
      document.head.appendChild(link);

      const onLoad = () => {
        if (isMounted) {
          // Check if the image is a 1x1 pixel placeholder
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
        document.head.removeChild(link); // Clean up the link tag
      };
    } else {
      setIsLoaded(true);
      setIsError(true);
    }
  }, [src]);

  return { isLoaded, isError, loadedImage };
};

/**
 * @function isGifOrMp4
 * @param {string} url - The URL to check.
 * @returns {boolean} True if the URL is a GIF or MP4, false otherwise.
 * @description Checks if a URL points to a GIF or MP4 file.
 */
const isGifOrMp4 = (url) => {
  const extension = url.split('.').pop().toLowerCase();
  return extension === 'gif' || extension === 'mp4';
};

/**
 * @component
 * @param {object} props
 * @param {object} props.item - The feed item data.
 * @param {string} props.apiUrl - The API URL.
 * @param {string} props.openAIKey - The OpenAI API key.
 * @description Renders a card for a feed item, with an image, website info, title, date, and description.
 */
const FeedCard = ({ item, apiUrl, openAIKey }) => {
  const [hover, setHover] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const navigate = useNavigate();

  // Modify the thumbnail URL if it is not a GIF or MP4
  const thumbnailUrl = useMemo(() => {
    if (item.thumbnail && !isGifOrMp4(item.thumbnail)) {
      return item.thumbnail;
    }
    return item.thumbnail;
  }, [item.thumbnail]);

  const { isLoaded, isError, loadedImage } = useImageLoader(thumbnailUrl);

  const elevation = useMemo(() => {
    if (mouseDown) return 8;
    if (hover) return 32;
    return 16;
  }, [mouseDown, hover]);

  const handleReaderviewOpen = (item) => {
    const encodedLink = encodeURIComponent(item.link);
    navigate(`/readerview/${encodedLink}`);
  };

  return (
    <motion.div
      style={{ position: "relative" }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setMouseDown(false);
      }}
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
      onClick={() => handleReaderviewOpen(item)}
    >
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            key="loader"
            layoutId={`card-${item.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <FeedCardLoader id={item.id} />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoaded && (
        <motion.div
          key="card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="card-wrapper">
            <DropShadow
              color={item.thumbnailColor || { r: 0, g: 0, b: 0 }}
              elevation={elevation}
            />

            <SlCard
              className="card"
              id={item.id}
            >
              <motion.div
                className="card-bg"
                layoutId={`card-bg-${item.id}`}
              >
                <div className="noise"></div>
                {loadedImage && (
                  <img src={loadedImage.src} alt={item.siteTitle} />
                )}
              </motion.div>

              {loadedImage && !isError && (
                <motion.div layoutId={`image-${item.id}`}>
                  <div className="image-container">
                    <img
                      src={loadedImage.src}
                      alt={item.siteTitle}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </div>
                </motion.div>
              )}

              <div
                className="text-content"
                style={{ padding: isError ? "" : "12px 24px" }}
              >
                <WebsiteInfo
                  favicon={item.favicon}
                  siteTitle={item.siteTitle}
                  feedTitle={item.site}              />
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
          </motion.div>
        )}
    </motion.div>
  );
};

export default React.memo(FeedCard);