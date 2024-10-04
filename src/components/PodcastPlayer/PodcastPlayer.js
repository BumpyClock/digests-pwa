import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import SlIconButton from "@shoelace-style/shoelace/dist/react/icon-button";
import "./PodcastPlayer.css"; // Add appropriate styling

const PodcastPlayer = forwardRef(({ src, onPlaybackRequest, AiFeatures }, ref) => {
  const audioRef = useRef(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Expose playback controls to parent component
  useImperativeHandle(ref, () => ({
    setPlaybackTime: (time) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    }
  }));

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const handleSkip = (seconds) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  const handleSpeedChange = () => {
    // Cycle through playback speeds: 1x, 1.25x, 1.5x, 1.75x, 2x
    const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
    const currentSpeedIndex = speeds.indexOf(playbackSpeed);
    const nextSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextSpeedIndex]);
  };

  return (
    <div className="podcast-player-container">
      <audio ref={audioRef} controls className="podcast-audio">
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <div className="podcast-player-controls">
        <SlIconButton
          name="rewind"
          library="iconoir"
          onClick={() => handleSkip(-30)}
          label="Rewind 30s"
        />
        <SlIconButton
          name="play"
          library="iconoir"
          onClick={onPlaybackRequest}
          label="Play"
        />
        <SlIconButton
          name="forward"
          library="iconoir"
          onClick={() => handleSkip(30)}
          label="Forward 30s"
        />
        <SlIconButton
          name="dashboard-speed"
          library="iconoir"
          onClick={handleSpeedChange}
          label={`Speed ${playbackSpeed}x`}
        />
      </div>
    </div>
  );
});

export default PodcastPlayer;