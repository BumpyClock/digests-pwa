import React from 'react';
import './ListView.css'; // Import the CSS for this component
import SlRelativeTime from '@shoelace-style/shoelace/dist/react/relative-time';

const ListView = ({ articles, selectedArticle, onArticleSelect }) => {
    return (
        <div className="iist-view-layout">
            <div className="article-list">
                {articles.map((article, index) => (
                    <div
                        key={index}
                        onClick={() => onArticleSelect(article)}
                        className={`article-item ${selectedArticle === article ? 'selected' : ''}`}
                    >
                        
                        <div className="image-container">
                            <img src={article.thumbnail} alt={article.title} />
                        </div>
                        <div className="info-container">
                        <h2 className="title">{article.title}</h2>
                        {article.content && <p className="author">{article.author}</p>}
                        <div className="date">
                            <SlRelativeTime date={new Date(article.published)} />
                        </div>          </div>
                        </div>
                ))}
            </div>
            <div className="reader-view">
                {/* Display the selected article in the reader view */}
                {selectedArticle && (
                    <>
                        <h1>{selectedArticle.title}</h1>
                        <p>{selectedArticle.content}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ListView;