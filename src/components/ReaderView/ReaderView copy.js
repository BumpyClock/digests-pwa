import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import axios from "axios";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import SlCard from "@shoelace-style/shoelace/dist/react/card";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./ReaderView.css";
import WebsiteInfo from "../website-info/website-info.js";
import CustomScrollbar from "../CustomScrollbar/CustomScrollbar.js";

function estimateReadingTime(text) {
  if (!text) return 0;
  const wordsPerMinute = 183;
  const words = text.trim().split(/\s+/).length;
  const readingTimeInMinutes = Math.ceil(words / wordsPerMinute);
  return readingTimeInMinutes;
}

const ReaderView = ({ url, item, apiUrl, onClose }) => {
  const [article, setArticle] = useState(null);
  const isLoading = useRef(true);
  const requestSent = useRef(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const modalRef = useRef(null);
  const articleRef = useRef(null);
  const contentcontainerRef = useRef(null);
  const scrollPositionRef = useRef(scrollPosition);
  const headerImageInfoRef = useRef(null);
  const viewportWidth = window.innerWidth;

  const [headerImageInfoInitialized, setHeaderImageInfoInitialized] =
    useState(false);

  const dynamicTop = useRef(0);
  function calculateHeaderHeight(scrollPosition) {
    return Math.max(
      500 - Math.pow(scrollPosition / 100, 1.5) * 50,
      200
    );
  }

  function calculateFontSize(scrollPosition) {
    const maxScrollForFontSizeChange = 500;
    let minFontSize;
    let maxFontSize;

    if (viewportWidth < 450) {
      maxFontSize = 10;
      minFontSize = 8;
    } else if (viewportWidth < 650) {
      maxFontSize = 12;
      minFontSize = 10;
    } else if (viewportWidth >= 600 && viewportWidth < 1200) {
      minFontSize = 14;
      maxFontSize = 16;
    } else {
      minFontSize = 14;
      maxFontSize = 16;
    }

    const scaleFactor = Math.max(
      0,
      Math.min(1, scrollPosition / maxScrollForFontSizeChange)
    );
    const fontSize =
      maxFontSize - scaleFactor * (maxFontSize - minFontSize);

    return `${fontSize}px`;
  }

  function calculateHeaderImageInfoBottom(scrollPosition) {
    const maxScroll = 500;
    const minBottom = -1;
    let maxBottom;
    if (viewportWidth < 600) {
      maxBottom = 1.5;
    } else if (viewportWidth >= 600 && viewportWidth < 1200) {
      maxBottom = 1;
    } else {
      maxBottom = 0.5;
    }
    const scaleFactor = Math.max(
      0,
      Math.min(1, scrollPosition / maxScroll)
    );
    const bottom = minBottom + scaleFactor * (maxBottom - minBottom);
    return `${bottom}em`;
  }

  const handleClickOutside = useCallback(
    (event) => {
      if (
        modalRef.current &&
        !contentcontainerRef.current.contains(event.target)
      ) {
        onClose();
        document.body.style.overflow = "";
        articleRef.current = null;
      }
    },
    [onClose]
  );

  useEffect(() => {
    // Disable background scrolling
    document.body.style.overflow = "hidden";

    const fetchArticle = async () => {
      try {
        requestSent.current = false;
        console.log("Fetching article content for: ", url, " from: ", apiUrl);
        const endpoint = `${apiUrl}/getreaderview`;
        const response = await axios.post(endpoint, {
          headers: {},
          urls: [url],
        });

        if (response.status === 200 && response.data[0].status === "ok") {
          setArticle({
            content: response.data[0].content,
            title: response.data[0].title,
            textContent: response.data[0].textContent,
          });
        } else {
          setArticle({ content: "Error getting article content" });
        }
      } catch (error) {
        console.error("Error fetching the page content:", error);
      }
      isLoading.current = false;
    };

    if (isLoading.current && url && requestSent.current) {
      fetchArticle();
    }

    return () => {
      document.body.style.overflow = "";
      articleRef.current = null;
    };
  }, [url, isLoading, headerImageInfoRef, apiUrl]);

  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const position = articleRef.current.scrollTop;
        if (scrollPositionRef.current !== position) {
          if (headerImageInfoRef.current) {
            dynamicTop.current = Math.max(
              calculateHeaderHeight(position) -
                headerImageInfoRef.current.offsetHeight,
              24
            );
          }
          setScrollPosition(position);
          scrollPositionRef.current = position;
        }
      }
    };

    const articleElement = articleRef.current;
    if (articleElement) {
      articleElement.addEventListener("scroll", handleScroll);
      return () => {
        articleElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [articleRef.current, isLoading.current]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        document.body.style.overflow = "";
        articleRef.current = null;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const calculateInitialDynamicTop = () => {
      const initialScrollPosition = 0;
      if (headerImageInfoRef.current) {
        const initialDynamicTop = Math.max(
          calculateHeaderHeight(initialScrollPosition) -
            headerImageInfoRef.current.offsetHeight,
          24
        );
        dynamicTop.current = initialDynamicTop;
      } else {
        console.error("Header image info ref not found");
      }
    };

    if (headerImageInfoInitialized) {
      calculateInitialDynamicTop();
    }
  }, [headerImageInfoInitialized]);

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const readerViewVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  return (
    <motion.div
      className={`modal-container ${isLoading.current ? "" : "visible"}`}
      ref={modalRef}
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={readerViewVariants}
      transition={{ duration: 0.3 }}
    ><CustomScrollbar>
      <SlCard
        className="card"
        layoutId={`card-${item.id}`}
        ref={contentcontainerRef}
        exit="exit"
        transition={{ duration: 0.3 }}
        style={{ fontSize: calculateFontSize(scrollPosition) }}
      >
        
                     <div className="image-container">
                <img
                  src={item.thumbnail}
                  alt={item.siteTitle}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
                      <div className="reader-view-header-button-container">
                      <SlIconButton
                        library="iconoir"
                        name="open-new-window"
                        class="reader-view-header-button"
                        onClick={() => {
                          window.open(url, "_blank");
                        }}
                      />
                      <SlIconButton
                        library="iconoir"
                        name="xmark"
                        class="reader-view-header-button"
                        onClick={onClose}
                      />
                    </div>
                    
      
          {isLoading.current ? (
            <SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />
          ) : (
            article && (
              <motion.div
                
                className="reader-view-motion-wrapper"
                variants={readerViewVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <div className="reader-view-page-content">
                  
                    
                    <div
                      className="header-image-info"
                      ref={headerImageInfoRef}
                      style={{
                        bottom: calculateHeaderImageInfoBottom(
                          scrollPosition
                        ),
                      }}
                    >
                      <WebsiteInfo
                        favicon={item.favicon}
                        siteTitle={item.siteTitle}
                        feedTitle={item.feedTitle}
                        style={{
                          marginBottom: "8px",
                          maxWidth: "fit-content",
                        }}
                      />
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <h1 className="reader-view-title">
                          {article.title}
                        </h1>
                      </a>
                      <p className="reader-view-reading-time">
                        {estimateReadingTime(article.textContent)}{" "}
                        minutes
                      </p>
                    </div>
                    
                  
                  <div
                    className="reader-view-page-text"
                    ref={articleRef}
                  >
                    <div
                      className="reader-view-article"
                      dangerouslySetInnerHTML={{
                        __html: article.content,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          )}
        
      </SlCard>
      </CustomScrollbar>
    </motion.div>
  );
};

export default ReaderView;