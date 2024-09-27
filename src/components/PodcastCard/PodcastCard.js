import React,{useMemo,useState} from 'react';
import { SlIcon, SlCard , SlRelativeTime} from '@shoelace-style/shoelace/dist/react';
import './PodcastCard.css';
import DropShadow from '../DropShadow/DropShadow.js'; // Import DropShadow
import PodcastDetails from '../PodcastDetails/PodcastDetails.js'; // Import PodcastDetails
import WebsiteInfo from '../website-info/website-info.js'; // Import WebsiteInfo


const PodcastCard = ({ item , AiFeatures}) => {
  const [hover, setHover] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);
  const [showPodcastDetails, setShowPodcastDetails] = useState(false);

  const elevation = useMemo(() => {
    if (mouseDown) return 8;
    if (hover) return 32;
    return 16;
  }, [mouseDown, hover]);


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
      if (!showPodcastDetails) {
        setTimeout(() => {
          if (!showPodcastDetails) {
            setShowPodcastDetails(true);
          }
        }, 500);
      }
    }}
  >
    <DropShadow color={item.thumbnailColor || {r:0,g:0,b:0}} elevation={elevation}/> 
    <SlCard className="card podcast-card" id={item.id}>
    
      {/* Card Image */}
      <div className="podcast-image-header" >
        <div className='background-image' style={{backgroundImage: `url(${item.thumbnail})`}}></div>
      <div className="icon-container">
        {item.feedImage && (
          <img src={item.feedImage} alt={item.title}  />
        )}
      </div>
      </div>
      <div className="card-bg">
      <img
        src={item.thumbnail}
        alt={item.siteTitle}
        // style={{ width: "100%", height: "100%" }}
      />
      <div className="noise"></div>
    </div>

      {/* Card Content */}
      <div className="text-content">
        {/* Title */}<WebsiteInfo
            favicon={"./assets/icons/podcast.svg"}
            siteTitle={item.feedTitle}
            feedTitle={item.siteTitle}
          />
        <h3 className="podcast-title">{item.title}</h3>
        <div className="date"><SlRelativeTime date={new Date(item.published)} /></div>


        {/* Description */}
        <p className="description">{item.description}</p>

        {/* Podcast Audio Player */}
        {/* <audio controls className="podcast-audio-player">
          <source src={item.enclosures[0].url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio> */}

        {/* External Link */}
        {item.externalLink && (
          <a href={item.externalLink} target="_blank" rel="noopener noreferrer">
            <SlIcon name="external-link" /> Listen on {item.source}
          </a>
        )}
      </div>

   
     
    </SlCard>
    {showPodcastDetails&& <PodcastDetails url={item.link} item={item} AiFeatures={AiFeatures} onClose={() => {
      setShowPodcastDetails(false);
    }} />}
    </div>
  );
};

export default React.memo(PodcastCard);

