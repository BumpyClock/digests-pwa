import React, { useState, useEffect } from "react";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import SlButton from "@shoelace-style/shoelace/dist/react/button";
import WebsiteInfo from "../website-info/website-info.js";
import "./FeedCard.css";
import FeedCardLoader from "../FeedCardLoader/FeedCardLoader.js";
import ColorThief from "colorthief";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";

const FeedCard = ({ item }) => {
  let thumbnailUrl = item.thumbnail;
  if (Array.isArray(item.thumbnail)) {
    thumbnailUrl = item.thumbnail.find(
      (thumbnail) => thumbnail.url || thumbnail.link
    )?.url;
  }

  const [dominantColor, setDominantColor] = useState("rgba(0,0,0,0.5)"); // Default color
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (thumbnailUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = thumbnailUrl;
      img.onload = () => {
        setIsImageLoaded(true);
        try {
          const colorThief = new ColorThief();
          const color = colorThief.getColor(img);
          setDominantColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`);
        } catch (error) {
          console.error("Error getting dominant color", error);
        }
      };
      img.onerror = () => {
        setIsImageLoaded(true);
        console.error("Error loading image");
        setDominantColor("rgba(0,0,0,0.5)"); // Set to default color on error
      };
    }
  }, [thumbnailUrl]);

  if (!isImageLoaded) {
    return <FeedCardLoader />;
  }

  return (
    <SlAnimation name="fade-in" duration={500} play={isImageLoaded}>
      <SlCard
        className="card"
        style={{
          boxShadow: `0 4px 8px 4px ${dominantColor}`,
          opacity: isImageLoaded ? 1 : 0,
          transition: "opacity 0.5s",
        }}
      >
        <div className="image-container">
          <img
            src={thumbnailUrl}
            alt={item.siteTitle}
            onLoad={() => setIsImageLoaded(true)}
          />
        </div>
        <div className="card-bg">
          <img src={thumbnailUrl} alt={item.siteTitle} />
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

export default FeedCard;
