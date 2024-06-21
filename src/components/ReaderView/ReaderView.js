import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import axios from "axios";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./ReaderView.css";
import WebsiteInfo from "../website-info/website-info.js";

function estimateReadingTime(text) {
  if (!text) return 0;
  const wordsPerMinute = 183; // Adjust this value based on your preferred reading speed
  const words = text.trim().split(/\s+/).length;
  const readingTimeInMinutes = Math.ceil(words / wordsPerMinute);
  return readingTimeInMinutes;
}



const ReaderView = ({ url, item, onClose }) => {
  const [article, setArticle] = useState(null);
  const isLoading  = useRef(true);
  const requestSent= useRef(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const modalRef = useRef(null);
  const articleRef = useRef(null);
  const contentcontainerRef = useRef(null);
  const scrollPositionRef = useRef(scrollPosition);
  const headerImageInfoRef = useRef(null);
  const [headerImageInfoInitialized, setHeaderImageInfoInitialized] = useState(false);

  const dynamicTop = useRef(0);
  function calculateHeaderHeight(scrollPosition) {
    return Math.max(500 - Math.pow(scrollPosition / 100, 1.5) * 50, 200);
  }
  

  useEffect(() => {
    // Disable background scrolling
    document.body.style.overflow = "hidden";

    

    const fetchArticle = async () => {
      try {
        requestSent.current=false;
        console.log("Fetching article content for: ", url);
        const response = await axios.post(
          `https://api.digests.app/getreaderview`,
          {
            headers: {
              // "Content-Type": "application/json"
            },
            urls: [url]
          }
        );

        if (response.status === 200 && response.data[0].status === "ok") {
          setArticle({
            content: response.data[0].content,
            title: response.data[0].title,
            textContent: response.data[0].textContent
          });
        } else {
          setArticle({ content: "Error getting article content" });
        }
      } catch (error) {
        console.error("Error fetching the page content:", error);
      }
      isLoading.current = false;
      // console.log("Article fetched");
      // console.log(isLoading);
    };

    if (isLoading.current && url && requestSent.current) {
      // console.log("calling fetchArticle");

    fetchArticle();
    
    }

    return () => {
      document.body.style.overflow = "";
      articleRef.current=null;
    };
  }, [url, isLoading,headerImageInfoRef]);



useEffect(() => {
  const handleScroll = () => {
    
    if (articleRef.current) {
      
      const position = articleRef.current.scrollTop;
      if (scrollPositionRef.current !== position) {
        if (headerImageInfoRef.current) {
          dynamicTop.current = Math.max(calculateHeaderHeight(position) - headerImageInfoRef.current.offsetHeight,24);
          // console.log("Dynamic top", dynamicTop.current);
        }
        setScrollPosition(position);
        scrollPositionRef.current = position; // Update the ref
      }
    }
  };

  // console.log("handleScroll is called", isLoading.current, articleRef.current);

  const articleElement = articleRef.current;
  if (articleElement) {
    // console.log("Adding scroll event listener to: ", articleElement);
    articleElement.addEventListener("scroll", handleScroll);
    return () => {
      // console.log("Removing scroll event listener from: ", articleElement);
      articleElement.removeEventListener("scroll", handleScroll);
    };
  }
  // eslint-disable-next-line
}, [articleRef.current, isLoading.current] ); 





useEffect(() => {
  // This function will be called whenever the user scrolls on the modal
  const handleModalScroll = () => {
    if (modalRef.current && articleRef.current) {
      // Calculate the scroll ratio or any other logic you want to use
      // For simplicity, we're directly using the scrollTop value of modalRef
      const scrollAmount = modalRef.current.scrollTop;
      console.log("Scrolling", scrollAmount);
      
      // Apply the scroll to articleRef
      articleRef.current.scrollTop = scrollAmount;
    }
  };

  // Add the scroll event listener to modalRef
  const modalElement = modalRef.current;
  if (modalElement) {
    modalElement.addEventListener('scroll', handleModalScroll);
    
    // Cleanup function to remove the event listener
    return () => {
      modalElement.removeEventListener('scroll', handleModalScroll);
    };
  }
}, [modalRef]);

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !contentcontainerRef.current.contains(event.target)) {
      onClose();
      document.body.style.overflow = ""; // Re-enable scrolling
      articleRef.current=null;
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        document.body.style.overflow = ""; // Re-enable scrolling
        articleRef.current=null;

      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  
  useEffect(() => {
    const calculateInitialDynamicTop = () => {
      const initialScrollPosition = 0; // Assuming the initial scroll position is 0
      if (headerImageInfoRef.current) {
        const initialDynamicTop = Math.max(calculateHeaderHeight(initialScrollPosition) - headerImageInfoRef.current.offsetHeight, 24);
        dynamicTop.current = initialDynamicTop;
        // console.log("Initial dynamic top", dynamicTop.current);
      }
      else {
        console.error("Header image info ref not found");
      }
    };
  
    if (headerImageInfoInitialized) {
      calculateInitialDynamicTop();
    }
  }, [headerImageInfoInitialized]);

  return (
    <div className={`modal-container ${isLoading.current ? '' : 'visible'}`} ref={modalRef}>
      <div className="modal-container-content" ref={contentcontainerRef}>
        <Suspense fallback={<SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />}>
          {isLoading.current ? (
            <SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />
          ) : (
            article && (
              <>
                <div className="reader-view-page-content" >

                  <div className="reader-view-header" style={{height:`${calculateHeaderHeight(scrollPosition)}px`}}>
                  <div className="reader-view-header-container">

                    <div
                      className="header-image"
                      style={{
filter: `blur(${Math.min(Math.pow(scrollPosition / 50, 2), 150)}px) opacity(${Math.max(1 - Math.pow(scrollPosition / 100, 2), 0.6)})`,         
height: `${calculateHeaderHeight(scrollPosition)}px`                      }}
                    >
                      {item.thumbnail && (
                        <img
                          src={item.thumbnail}
                          alt="Header"
                        
                        />
                      )}
                    </div></div>
                    <div className="header-image-info" ref={headerImageInfoRef} >
                      <WebsiteInfo
                        favicon={item.favicon}
                        siteTitle={item.siteTitle}
                        feedTitle={item.feedTitle}
                        style={{ marginBottom: '8px', maxWidth: 'fit-content' }}
                      />
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <h1 className="reader-view-title">{article.title}</h1>
                      </a>
                      <p className="reader-view-reading-time">
                        {estimateReadingTime(article.textContent)} minutes
                      </p>
                    </div>
                    <div className="reader-view-header-button-container">
                      <SlIconButton
                        library="iconoir"
                        name="open-new-window"
                        class="reader-view-header-button"
                        onClick={() => {
                          window.open(url, '_blank');
                        }}
                      />
                      <SlIconButton
                        library="iconoir"
                        name="xmark"
                        class="reader-view-header-button"
                        onClick={onClose}
                      />
                    </div>
                  </div>
                  <div className="reader-view-page-text" ref={articleRef} style={{top: `${calculateHeaderHeight(scrollPosition)+40}px`}}>
                    <div
                      className="reader-view-article"
                      dangerouslySetInnerHTML={{ __html: article.content }}
                    />
                  </div>
                </div>
              </>
            )
          )}
        </Suspense>
      </div>
    </div>
  );
};


export default ReaderView;