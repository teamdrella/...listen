import React, { useState, useEffect } from 'react';

interface Track {
  artistName: string;
  albumName: string;
  year: number;
  trackName: string;
  duration: string;
}

interface PlaylistProps {
  tracks: Track[];
  activeTrackIndex: number;
  setActiveTrackIndex: (index: number) => void; // Prop for setting active track index
  setTracks: (tracks: Track[]) => void; // Prop for setting tracks state
}

const Playlist: React.FC<PlaylistProps> = ({ tracks, activeTrackIndex, setActiveTrackIndex, setTracks }) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null); // Store the index of the dragged track
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // Store the index of the hovered track

  // Sync dragged index with incoming props
  useEffect(() => {
    setDraggedIndex(null);
    setHoveredIndex(null);
  }, [tracks]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>, index: number) => {
    event.preventDefault(); // Prevent default to allow drop
    if (draggedIndex !== index) {
      setHoveredIndex(index); // Set hovered index to indicate where the item can be dropped
    }
  };

  const handleDragLeave = () => {
    setHoveredIndex(null); // Clear hovered index when leaving
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const updatedTracks = [...tracks]; // Use props directly instead of local state
      const [movedTrack] = updatedTracks.splice(draggedIndex, 1); // Remove the dragged track
      updatedTracks.splice(index, 0, movedTrack); // Insert it at the new index
      
      setTracks(updatedTracks); // Update parent state with new order

      // Update active track index if necessary
      if (draggedIndex === activeTrackIndex) {
        // If dragging the active track, just update its position
        setActiveTrackIndex(index);
      } else if (draggedIndex < activeTrackIndex && index >= activeTrackIndex) {
        // Moved above the previous position of the active track
        setActiveTrackIndex(activeTrackIndex - 1);
      } else if (draggedIndex > activeTrackIndex && index <= activeTrackIndex) {
        // Moved below the previous position of the active track
        setActiveTrackIndex(activeTrackIndex + 1);
      }
    }
    setDraggedIndex(null); // Reset dragged index
    setHoveredIndex(null); // Clear hovered index on drop
  };

  const handleDoubleClick = (index: number) => {
    setActiveTrackIndex(index); // Set the active track index on double click
  };

  return (
    <div style={{ maxWidth: '750px', border: '2px solid grey', borderRadius: '10px', backgroundColor: 'white', padding: '10px' }}>
      <div className="overflow-x-auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ textAlign: 'left', padding: '8px' }}>#</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Artist</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Album</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Year</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Track</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Duration</th>
            </tr>
          </thead>
          <tbody>
            {tracks.length > 0 ? (
              tracks.map((track, index) => (
                <tr 
                  key={index} 
                  style={{
                    fontWeight: index === activeTrackIndex ? 'bold' : 'normal',
                    borderTop: hoveredIndex === index && draggedIndex !== null ? "2px solid black" : "2px solid transparent", // Visual cue as a top border
                    transition: "border-top 0s" // Smooth transition for highlight effect
                  }} 
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(event) => handleDragOver(event, index)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(index)}
                  onDoubleClick={() => handleDoubleClick(index)} // Set active track on double-click
                >
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{index + 1}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{track.artistName}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{track.albumName}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{track.year}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{track.trackName}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{track.duration}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '8px' }}>No tracks available</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Hide content of dragged item */}
        {draggedIndex !== null && (
          <style>{`
            tr[data-dragging='true'] td {
              visibility: hidden; /* Hide contents of dragged item */
            }
          `}</style>
        )}
      </div>
    </div>
  );
};

export default Playlist;