import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const TextToSpeechPlayer = ({ articleText, apiUrl, articleUrl, onHighlight }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  // Add a state to track if audio has been fetched
  const [audioFetched, setAudioFetched] = useState(false);

  const fetchAudio = async (cancelToken) => {
    console.log('fetchAudio called');
    console.log('API URL:', `${apiUrl}/streamaudio`);
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/streamaudio`,
        { text: articleText ,
          url: articleUrl
        },
        {
          headers: { 'Content-Type': 'application/json' }, // Ensure correct headers
          responseType: 'arraybuffer', // Expect binary data
          cancelToken: cancelToken.token, // Pass the cancel token
        }
      );

      console.log('Audio data received:', response.data);
      console.log('Response headers:', response.headers);

      // Create a blob from the audio data
      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      console.log('Audio Blob:', audioBlob);

      if (audioBlob.size === 0) {
        throw new Error('Received empty audio blob.');
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('Audio URL:', audioUrl);

      // Set up the audio element
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = playbackSpeed;
      }

      setAudioFetched(true); // Mark audio as fetched
      setLoading(false);
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Error fetching audio:', error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
        }
      }
      setLoading(false);
    }
  };

  const playAudio = () => {
    console.log('playAudio called');
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          console.log('Audio playback started');
          setIsPlaying(true);
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
        });
    }
  };

  const pauseAudio = () => {
    console.log('pauseAudio called');
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      console.log('Audio playback paused');
    }
  };

  const stopAudio = () => {
    console.log('stopAudio called');
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      if (onHighlight) {
        onHighlight(null); // Reset highlighting
      }
      clearInterval(intervalRef.current);
      console.log('Audio playback stopped and reset');
    }
  };

  const togglePlayPause = () => {
    console.log('togglePlayPause called');
    if (isPlaying) {
      pauseAudio();
      clearInterval(intervalRef.current);
    } else {
      if (!audioFetched) { // Check if audio has been fetched
        const cancelToken = axios.CancelToken.source();
        fetchAudio(cancelToken).then(() => {
          playAudio();
        });
      } else {
        playAudio();
      }
    }
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    console.log(`Playback speed changed to ${newSpeed}x`);
    setPlaybackSpeed(newSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = newSpeed;
    }
  };

  useEffect(() => {
    const audioElement = audioRef.current;
    // Clean up on unmount
    return () => {
      console.log('Component unmounting, cleaning up');
      
      if (audioElement) {
        audioElement.pause();
        audioElement.src = '';
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      // Wait for the audio to load metadata to get duration
      const handleLoadedMetadata = () => {
        console.log('loadedmetadata event fired');
        const words = articleText.split(/\s+/);
        const totalWords = words.length;
        const estimatedDuration = audioRef.current.duration * 1000; // in milliseconds
        const interval = estimatedDuration / totalWords;

        console.log(`Estimated duration: ${estimatedDuration}ms for ${totalWords} words`);
        console.log(`Highlight interval set to ${interval}ms`);

        let wordIndex = 0;
        intervalRef.current = setInterval(() => {
          if (wordIndex < totalWords) {
            if (onHighlight) {
              onHighlight(wordIndex);
            }
            wordIndex += 1;
          } else {
            clearInterval(intervalRef.current);
            console.log('Completed highlighting all words');
          }
        }, interval);
      };

      const audioElement = audioRef.current;
      audioElement.addEventListener('loadedmetadata', handleLoadedMetadata);

      // Cleanup
      return () => {
        if (audioElement) {
          audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    } else {
      // If not playing, clear any existing intervals
      clearInterval(intervalRef.current);
      console.log('Not playing, cleared any existing intervals');
    }
  }, [isPlaying, articleText, onHighlight]);

  return (
    <div className="tts-player">
      <button onClick={togglePlayPause} disabled={loading}>
        {loading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}
      </button>
      <label>
        Speed:
        <input
          type="range"
          min="0.5"
          max="2"
          value={playbackSpeed}
          step="0.1"
          onChange={handleSpeedChange}
        />
        {playbackSpeed}x
      </label>
      <button onClick={stopAudio} disabled={!isPlaying && !loading}>
        Stop
      </button>
      <audio
        ref={audioRef}
        onEnded={() => {
          console.log('Audio ended');
          setIsPlaying(false);
          if (onHighlight) {
            onHighlight(null);
          }
        }}
      />
    </div>
  );
};

export default TextToSpeechPlayer;