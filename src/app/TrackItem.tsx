import React, { useState, useEffect, useRef } from 'react';

// Icons for play and pause buttons
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path fill="gray" d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path fill="gray" d="M6 19h4V5H6zm8-14v14h4V5z" />
  </svg>
);

// Updated TrackItem component
const TrackItem = ({ 
  albumCover, 
  trackName, 
  artistName, 
  duration, 
  isActive,
  audioFile // Add audioFile prop
}) => {
  
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Create a reference to the audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
    // You can add more logic here for actual audio playback
  };

  // Set up the audio element on mount
  useEffect(() => {
    if (audioRef.current) {
      // Set the source of the audio element
      audioRef.current.src = audioFile;
      if (isActive) {
        // Play if this track is active
        audioRef.current.play();
      }
    }
    
    return () => {
      // Cleanup on unmount
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = ""; // Clear source to prevent memory leaks
      }
    };
    
  }, [audioFile, isActive]); // Re-run effect if these change

  return (
    <div 
      className="track-item" 
      style={{ 
        ...styles.trackItem, 
        border: isActive ? '2px solid grey' : '2px solid gray' 
      }} 
    >
      <img src={albumCover} alt="Album Cover" style={styles.albumCover} />
      <div className="track-details" style={styles.trackDetails}>
        <div style={styles.trackName}>{trackName}</div>
        <div style={styles.artistName}>{artistName}</div>
        <div style={styles.duration}>{duration}</div>
      </div>
      <button onClick={handlePlayPause} style={styles.playPauseButton}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>
      
      {/* Hidden Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
};

// Styles as a JavaScript object
const styles = {
  trackItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '10px',
    margin: '10px 0',
    maxWidth: '500px', // Set maximum width to 500px
    filter: 'url(#pixelate)',
    width: '100%', // Allow it to be responsive within the max width
    cursor: 'pointer', // Add a pointer cursor for better UX
    transition: 'border-color 0.3s', // Smooth transition for border color
  },
  albumCover: {
    width: '60px',
    height: '60px',
    borderRadius: '5px',
    objectFit: 'cover',
    marginRight: '10px',
  },
  trackDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    marginRight: '10px',
  },
  trackName: {
    fontWeight: 'bold',
    fontSize: '14px',
  },
  artistName: {
    fontSize: '12px',
    color: 'gray',
  },
  duration: {
    fontSize: '12px',
    color: 'gray',
  },
  playPauseButton: {
    backgroundColor: 'white',
    border: '2px solid gray',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    outline: 'none',
  },
};

export default TrackItem;