import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { SlIconButton } from "@shoelace-style/shoelace/dist/react";
import axios from 'axios';
import "./PodcastPlayer.css";

const PodcastPlayer = forwardRef(({ src, onPlaybackRequest, AiFeatures }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const wavesurferRef = useRef(null);
  const waveformRef = useRef(null);
  const isComponentMounted = useRef(true);

  // Expose playback controls to parent component
  useImperativeHandle(ref, () => ({
    setPlaybackTime: (time) => {
      if (wavesurferRef.current) {
        wavesurferRef.current.setCurrentTime(time);
      }
    }
  }));

  useEffect(() => {
    // Set the flag to true when the component is mounted
    isComponentMounted.current = true;

    // Fetch the audio file and load into WaveSurfer
    const fetchAudio = async () => {
      try {
        setLoading(true);
        // Assume src is the URL from which to fetch the audio (if it's not directly available)
        const response = await axios.get(src, {
          responseType: 'arraybuffer',
        });

        // Create an audio blob and URL
        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching audio:', err);
        setError('Failed to load audio. Please try again.');
        setLoading(false);
      }
    };

    if (src) {
      fetchAudio();
    }

    // Clean up function to revoke audio URL and set flag to false
    return () => {
      isComponentMounted.current = false;
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.unAll();
          wavesurferRef.current.destroy();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error during WaveSurfer destroy:', err);
          }
        }
        wavesurferRef.current = null;
      }
    };
  }, [src]);

  useEffect(() => {
    // Initialize WaveSurfer only when audio URL is available
    if (audioUrl && waveformRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(150, 150, 150, 1)',
        progressColor: 'rgba(50, 50, 50, .7)',
        height: 80,
      });

      wavesurferRef.current.load(audioUrl);

      wavesurferRef.current.on('ready', () => {
        if (isComponentMounted.current) {
          wavesurferRef.current.setPlaybackRate(playbackSpeed);
          setLoading(false);
        }
      });

      wavesurferRef.current.on('error', (error) => {
        console.error("WaveSurfer error:", error);
        setError('Failed to load audio. Please try again.');
      });
    }

    return () => {
      if (wavesurferRef.current) {
        try {
          wavesurferRef.current.unAll();
          wavesurferRef.current.destroy();
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error('Error during WaveSurfer destroy:', err);
          }
        }
        wavesurferRef.current = null;
      }
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(wavesurferRef.current.isPlaying());
    }
  };

  const handleSpeedChange = () => {
    // Cycle through playback speeds: 1x, 1.25x, 1.5x, 1.75x, 2x
    const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
    const currentSpeedIndex = speeds.indexOf(playbackSpeed);
    const nextSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextSpeedIndex]);

    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(speeds[nextSpeedIndex]);
    }
  };

  const handleSkip = (seconds) => {
    if (wavesurferRef.current) {
      const currentTime = wavesurferRef.current.getCurrentTime();
      wavesurferRef.current.setCurrentTime(currentTime + seconds);
    }
  };

  return (
    <div className="podcast-player-container">
      <div id="waveform" ref={waveformRef}>
        {loading && <div className="waveform-skeleton"></div>}
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className='podcast-player-controls'>
          <SlIconButton
            name="rewind"
            library="iconoir"
            onClick={() => handleSkip(-30)}
            label="Rewind 30s"
          />
          <SlIconButton
            name={isPlaying ? "pause" : "play"}
            library="iconoir"
            onClick={handlePlayPause}
            label={isPlaying ? "Pause" : "Play"}
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
      )}
    </div>
  );
});

export default PodcastPlayer;
