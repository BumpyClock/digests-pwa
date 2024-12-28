// AppBar.js
import React from "react";
import { Link } from "react-router-dom";
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./AppBar.css";
import useAppStore from "../../data/store";

const AppBar = ({ refreshFeed }) => {
  const { showSettings, toggleSettings } = useAppStore();

  return (
    <div className="top-bar">
      <div className="button-container">
        {/* Home Button */}
        <Link to="/">
          <SlIconButton
            className="icon-button"
            name="home"
            id="homeButton"
            size="large"
            library="iconoir"
            style={{ cursor: "pointer" }}
          />
        </Link>

        {/* Refresh Button */}
        <SlIconButton
          className="icon-button"
          name="refresh"
          id="refreshButton"
          size="large"
          library="iconoir"
          style={{ cursor: "pointer" }}
          onClick={refreshFeed}
        />

        {/* Settings Button */}
        <Link to="/settings">
          <SlIconButton
            className="icon-button"
            name={showSettings ? "xmark" : "settings"}
            size="large"
            library="iconoir"
            id="settingsButton"
            style={{ cursor: "pointer" }}
            onClick={(event) => {
              toggleSettings();
            }}
          />
        </Link>
      </div>
    </div>
  );
};

export default AppBar;