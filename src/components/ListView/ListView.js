import React, { useState } from 'react';
import './ListView.css'; // Import the CSS for this component
import SlRelativeTime from '@shoelace-style/shoelace/dist/react/relative-time';
import SlSpinner from "@shoelace-style/shoelace/dist/react/spinner";
import ReaderViewContent from '../ReaderViewContent/ReaderViewContent.js'; // Import the ReaderViewContent component
import axios from "axios";
import WebsiteInfo from '../website-info/website-info.js';

const ListView = ({ articles }) => {
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const onArticleSelect = async (article) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `https://api.bumpyclock.com/getreaderview`,
                {
                    headers: {
                        "Content-Type": "application/json"
                    },
                    urls: [article.link]
                }
            );
    
            if (response.status === 200 && response.data[0].status === "ok") {
                setSelectedArticle({
                    content: response.data[0].content,
                    title: response.data[0].title,
                    textContent: response.data[0].textContent,
                    url: article.link, // Add the url to the selectedArticle state
                    item: article // Add the entire article object to the selectedArticle state
                });
            } else {
                setSelectedArticle({ content: "Error getting article content" ,
                title: response.data[0].title,
                textContent: response.data[0].textContent,
                url: article.link, // Add the url to the selectedArticle state
                item: article // Add the entire article object to the selectedArticle state
            });
            }
        } catch (error) {
            console.error("Error fetching the page content:", error);
        }
        setIsLoading(false);
    };

    return (
        <div className="list-view-layout">
            <div className="article-list">
                {articles.map((article, index) => (
                    <div
                        key={index}
                        onClick={() => onArticleSelect(article)}
                        className={`article-item ${selectedArticle === article ? 'selected' : ''}`}
                    >
                       {article.thumbnail ? (
  <div className="image-container">
    <img 
      src={`https://digests-imgproxy-a4crwf5b7a-uw.a.run.app/unsafe/rs:fit:0:300:0/g:no/plain/${encodeURIComponent(article.thumbnail)}@webp`} 
      alt={article.title} 
    />
  </div>
) : null}
                        <div className="info-container">
                        <WebsiteInfo
              favicon={article.favicon}
              siteTitle={article.siteTitle}
              feedTitle={article.feedTitle}
              style={{ marginBottom: '8px' }}
            />
                            <h2 className="title">{article.title}</h2>
                            {article.content && <p className="author">{article.author}</p>}
                            <div className="date">
                                <SlRelativeTime date={new Date(article.published)} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="reader-view">
                {/* Display the selected article in the reader view */}
                {isLoading ? (<div className="loading">
             <SlSpinner style={{ fontSize: "3rem", margin: "2rem" }} /></div>

) : (
    selectedArticle && <ReaderViewContent article={selectedArticle} url={selectedArticle.url} item={selectedArticle.item}/>
)}
            </div>
        </div>
    );
};

export default ListView;
