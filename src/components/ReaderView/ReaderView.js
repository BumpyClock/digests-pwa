import React, { useState, useEffect, useRef, useCallback, Suspense, lazy } from "react";
import axios from "axios";
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import "./ReaderView.css";
import Modal from "../Modal/Modal.js";
const ReaderViewContent = lazy(() => import('../ReaderViewContent/ReaderViewContent.js'));


function updateReadingProgress(progressCircle, pageText) {
  const scrollPosition = pageText.scrollTop;
  const maxScroll = pageText.scrollHeight - pageText.clientHeight;
  const progressPercentage = (scrollPosition / maxScroll) * 100;
  const setCircularProgress = (progressIndicator, progressPercentage) => {
    const radius = progressIndicator.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progressPercentage / 100) * circumference;
    progressIndicator.style.strokeDashoffset = offset;
  };

  setCircularProgress(progressCircle, progressPercentage);
}

const ReaderView = ({ url, item, onClose }) => {
  const [article, setArticle] = useState(null);
  // eslint-disable-next-line
  const progressCircleRef = useRef(null);
  const pageTextRef = useRef(null);
  const articleRef = useRef(null);
  const modalRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Disable background scrolling
    document.body.style.overflow = "hidden";

    const fetchArticleFromEndpoint = async () => {
      try {
        const response = await axios.post(
          `https://api.bumpyclock.com/getreaderview`,
          {
            headers: {
              "Content-Type": "application/json"
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
        // console.log("🚀 ~ fetchArticle ~ for", url);
      } catch (error) {
        console.error("Error fetching the page content:", error);
      }
      setIsLoading(false);
    };


    fetchArticleFromEndpoint();

    // fetchArticleFromEndpoint();

    // Cleanup function to re-enable background scrolling
    return () => {
      document.body.style.overflow = "";
    };
  }, [url]); // Effect runs when URL changes

  const handleGlobalScroll = useCallback((event) => {
  if (modalRef.current && articleRef.current) {
    event.preventDefault();
    const { scrollTop, scrollHeight, clientHeight } = articleRef.current;
    const wheel = event.deltaY < 0 ? -1 : 1;
    const newScrollTop = scrollTop + (wheel * 30); // 30 is the scroll speed, adjust as needed

    // Prevent scrolling beyond the content
    if (newScrollTop < 0) {
      articleRef.current.scrollTop = 0;
    } else if (newScrollTop > scrollHeight - clientHeight) {
      articleRef.current.scrollTop = scrollHeight - clientHeight;
    } else {
      articleRef.current.scrollTop = newScrollTop;
    }
  }
}, []);


  const handleScroll = useCallback(() => {
    updateReadingProgress(progressCircleRef.current, articleRef.current);
  }, []);

  useEffect(() => {
  window.addEventListener('wheel', handleGlobalScroll, { passive: false });

  return () => {
    window.removeEventListener('wheel', handleGlobalScroll);
  };
}, [handleGlobalScroll]);

  useEffect(() => {
    const articleElement = articleRef.current;

    if (articleElement) {
      articleElement.addEventListener("scroll", handleScroll);
      return () => {
        articleElement.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll, article]); 

  const handleClickOutside = useCallback((event) => {
    if (modalRef.current && !articleRef.current.contains(event.target)) {
      onClose();
      document.body.style.overflow = ""; // Re-enable scrolling
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleModalScroll = useCallback((event) => {
    articleRef.current.scrollTop = event.target.scrollTop;
  }, []);

  useEffect(() => {
    const modalElement = modalRef.current;

    if (modalElement) {
      modalElement.addEventListener("scroll", handleModalScroll);
      return () => {
        modalElement.removeEventListener("scroll", handleModalScroll);
      };
    }
  }, [handleModalScroll]);

  return (
    <Modal onClose={onClose}>
      <Suspense fallback={<SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />}>
        {isLoading ? (
          <SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} />
        ) : (
          article && (
            <ReaderViewContent
              article={article}
              url={url}
              onClose={onClose}
              progressCircleRef={progressCircleRef}
              pageTextRef={pageTextRef}
              item={item}
            />
          )
        )}
      </Suspense>
    </Modal>
  );
};

export default ReaderView;
