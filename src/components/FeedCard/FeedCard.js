import React, { useState, useEffect } from "react";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import SlButton from "@shoelace-style/shoelace/dist/react/button";
import WebsiteInfo from "../website-info/website-info.js";
import "./FeedCard.css";
import FeedCardLoader from "../FeedCardLoader/FeedCardLoader.js";
import ColorThief from "colorthief";
import SlAnimation from "@shoelace-style/shoelace/dist/react/animation";
import DropShadow from "../DropShadow/DropShadow.js"; // Import DropShadow



const useImageLoader = (src) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [loadedImage, setLoadedImage] = useState(null);
  const [dominantColor, setDominantColor] = useState("rgba(0,0,0,0.12)");

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;

      const onLoad = () => {
        setIsLoaded(true);
        setLoadedImage(img);
       if(img === null || img === 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7') {
          setDominantColor("rgba(0,0,0,0.12)");
        };
        try {
          const colorThief = new ColorThief();
          const color = colorThief.getColor(img);
          setDominantColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.12)`);
        } catch (error) {
          console.error("Error getting dominant color", error, src);
          console.log("image address is " + img.src);
        }
      };

      const onError = () => {
        setIsLoaded(true);
        setIsError(true);
        console.error("Error loading image");
        setDominantColor("rgba(0,0,0,0.12)"); // Set to default color on error
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
  }, [src]);
   // Generate drop shadow

  return { isLoaded, isError, loadedImage, dominantColor };
};


const FeedCard = ({ item }) => {
  let thumbnailUrl = item.thumbnail;
  if (Array.isArray(item.thumbnail)) {
    thumbnailUrl = item.thumbnail.find(
      (thumbnail) => thumbnail.url || thumbnail.link
    )?.url;
  }

  const { isLoaded, isError, loadedImage, dominantColor } = useImageLoader(thumbnailUrl);

  if (!isLoaded) {
    return <FeedCardLoader />;
  }

  return (
    <SlAnimation name="fade-in" duration={500} play={isLoaded}>
      <div style={{ position: 'relative' }}> 

        <DropShadow color={dominantColor} elevation={16} />
        <SlCard
          className="card"
          style={{
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.5s",
          }}
        >
      {!isError && (
        <div className="image-container">
          <img
            src={loadedImage.src}
            alt={item.siteTitle}
          />
        </div>
      )}
      <div className="card-bg">
        <img src={loadedImage.src} alt={item.siteTitle} />
        <div className="noise"></div>
      </div>
      <div className="text-content" style={{ padding: isError ? '' : '12px 24px' }}>
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
    </div>
  </SlAnimation>
);
};

export default React.memo(FeedCard);