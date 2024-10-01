// TextToSpeechPlayer.js

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import WaveSurfer from 'wavesurfer.js';
import { SlIconButton } from '@shoelace-style/shoelace/dist/react/';
import './TextToSpeechPlayer.css';

const TextToSpeechPlayer = ({ articleText, apiUrl, articleUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [loading, setLoading] = useState(true); // Start with loading as true
  const [audioUrl, setAudioUrl] = useState(null);
  const [error, setError] = useState(null);

  const wavesurferRef = useRef(null);
  const waveformRef = useRef(null); // Reference to the waveform container

  useEffect(() => {
    // Ensure that the WaveSurfer is initialized after the component mounts
    if (waveformRef.current && !wavesurferRef.current) {
      // Initialize WaveSurfer with custom render function
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(150, 150, 150,1)',
        progressColor: 'rgba(50, 50, 50,.7)',
       
      });

      // Fetch audio and load it into WaveSurfer
      const fetchAudio = async () => {
        try {
          const response = await axios.post(
            `${apiUrl}/streamaudio`,
            { text: articleText, url: articleUrl },
            {
              headers: { 'Content-Type': 'application/json' },
              responseType: 'arraybuffer',
            }
          );

          const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
          const url = URL.createObjectURL(audioBlob);
          setAudioUrl(url);

          if (wavesurferRef.current) {
            wavesurferRef.current.load(url);
            wavesurferRef.current.on('ready', () => {
              wavesurferRef.current.setPlaybackRate(playbackSpeed);
              wavesurferRef.current.play();
              setIsPlaying(true);
              setLoading(false); // Audio is ready
            });
          }
        } catch (err) {
          console.error('Error fetching audio:', err);
          setError('Failed to generate audio. Please try again later.');
          setLoading(false);
        }
      };

      fetchAudio();
    }

    // Clean up function to destroy WaveSurfer instance
    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
    //eslint-disable-next-line
  }, [apiUrl, articleText, articleUrl]);

  const togglePlayPause = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
      setIsPlaying(wavesurferRef.current.isPlaying());
    }
  };

  const handleSpeedClick = (e) => {
    e.preventDefault();
    let newSpeed;
    if (e.ctrlKey || e.metaKey) {
      // Ctrl + click or Cmd + click: decrease speed
      newSpeed = playbackSpeed - 0.2;
      if (newSpeed < 1.0) {
        newSpeed = 2.0;
      }
    } else {
      // Regular click: increase speed
      newSpeed = playbackSpeed + 0.2;
      if (newSpeed > 2.0) {
        newSpeed = 1.0;
      }
    }
    // Round to one decimal place
    newSpeed = Math.round(newSpeed * 10) / 10;

    setPlaybackSpeed(newSpeed);
    if (wavesurferRef.current) {
      wavesurferRef.current.setPlaybackRate(newSpeed);
    }
  };

  return (
    <div className="tts-player">
      <div id="waveform" ref={waveformRef}>
        {loading && <div className="waveform-skeleton"></div>}
      </div>

      {error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className='playback-control-container'>
          <SlIconButton
            className="icon-button"
            onClick={togglePlayPause}
            disabled={loading}
            library="iconoir"
            name={isPlaying ? 'pause' : 'play'}
            size="large"
            style={{ cursor: 'pointer' }}
          />
          <div
            className="playback-speed-control"
            onClick={handleSpeedClick}
            title="Click to increase speed. Ctrl+Click to decrease speed."
          >
            {`${playbackSpeed.toFixed(1)}x`}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextToSpeechPlayer;