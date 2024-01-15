import React, { useState, useEffect } from "react";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import SlButton from "@shoelace-style/shoelace/dist/react/button";
import WebsiteInfo from "../website-info/website-info.js";
import "./FeedCard.css";
import FeedCardLoader from "../FeedCardLoader/FeedCardLoader.js";
import ColorThief from "colorthief";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";

const useImageLoader = (src) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadedImage, setLoadedImage] = useState(null);
  const [dominantColor, setDominantColor] = useState("rgba(0,0,0,0.5)");

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;

      const onLoad = () => {
        setIsLoaded(true);
        setLoadedImage(img);
        try {
          const colorThief = new ColorThief();
          const color = colorThief.getColor(img);
          setDominantColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`);
        } catch (error) {
          console.error("Error getting dominant color", error);
        }
      };

      const onError = () => {
        setIsLoaded(true);
        console.error("Error loading image");
        setDominantColor("rgba(0,0,0,0.5)"); // Set to default color on error
      };

      img.onload = onLoad;
      img.onerror = onError;

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [src]);

  return { isLoaded, loadedImage, dominantColor };
};

const FeedCard = ({ item }) => {
  let thumbnailUrl = item.thumbnail;
  if (Array.isArray(item.thumbnail)) {
    thumbnailUrl = item.thumbnail.find(
      (thumbnail) => thumbnail.url || thumbnail.link
    )?.url;
  }

  const { isLoaded, loadedImage, dominantColor } = useImageLoader(thumbnailUrl);

  if (!isLoaded) {
    return <FeedCardLoader />;
  }

  return (
    <SlAnimation name="fade-in" duration={500} play={isLoaded}>
      <SlCard
        className="card"
        style={{
          boxShadow: `0 4px 8px 4px ${dominantColor}`,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        <div className="image-container">
          <img
            src={loadedImage.src}
            alt={item.siteTitle}
          />
        </div>
        <div className="card-bg">
          <img src={loadedImage.src} alt={item.siteTitle} />
          <div className="noise"></div>
        </div>
        <div className="text-content">
          <WebsiteInfo
            favicon={item.favicon}
            siteTitle={item.siteTitle}
            feedTitle={item.feedTitle}
          />
          <h3>{item.title}</h3>
          {item.content && <p className="description">{item.content}</p>}
          <div className="date">
            {new Date(item.published).toLocaleString()}
          </div>
          {!thumbnailUrl && item.description && (
            <div className="description long-description">
              {item.description}
            </div>
          )}
          <SlButton variant="text" href={item.link}>
            Read More
          </SlButton>
        </div>
      </SlCard>
    </SlAnimation>
  );
};

export default React.memo(FeedCard);