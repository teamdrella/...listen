// SkyPage.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import TrackItem from './TrackItem'; 
import Playlist from './Playlist'; 

// Generate 2D Perlin noise for cloud pattern
const generatePerlinNoise = (width: number, height: number, scale: number, timeOffsetX: number, timeOffsetY: number): number[][] => {
  const noise = Array.from({ length: width }, () => Array(height).fill(0));
  const randomValues = Array.from({ length: (width + 1) * (height + 1) }, () => Math.random());

  const interpolate = (x0: number, x1: number, t: number) => (1 - t) * x0 + t * x1;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const gridX = Math.floor((x + timeOffsetX) / scale);
      const gridY = Math.floor((y + timeOffsetY) / scale);

      const xOffset = ((x + timeOffsetX) / scale) - gridX;
      const yOffset = ((y + timeOffsetY) / scale) - gridY;

      const topLeft = randomValues[gridY * (width + 1) + gridX];
      const topRight = randomValues[gridY * (width + 1) + (gridX + 1)];
      const bottomLeft = randomValues[(gridY + 1) * (width + 1) + gridX];
      const bottomRight = randomValues[(gridY + 1) * (width + 1) + gridX + 1];

      const top = interpolate(topLeft, topRight, xOffset);
      const bottom = interpolate(bottomLeft, bottomRight, xOffset);
      const value = interpolate(top, bottom, yOffset);

      noise[x][y] = (value + 1) / 2 * 255; // Normalize to [0, 255]
    }
  }

  return noise;
};

// Create pixelated sky and manage drawing
const createPixelatedSky = (ctx, width, height, pixelSize, previousNoise, newNoise, blendFactor) => {
  const cols = Math.ceil(width / pixelSize);
  const rows = Math.ceil(height / pixelSize);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const grayValue = interpolate(previousNoise[x][y], newNoise[x][y], blendFactor);
      let cloudColor = grayValue > 210 ? 255 : grayValue > 180 ? 230 : 200;

      ctx.fillStyle = `rgb(${cloudColor}, ${cloudColor}, ${cloudColor})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;

  for (let x = 0; x <= width; x += pixelSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  for (let y = 0; y <= height; y += pixelSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};

const interpolate = (x0: number, x1: number, t: number) => (1 - t) * x0 + t * x1;

export default function SkyPage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeOffsetXRef = useRef(0);
  const timeOffsetYRef = useRef(0);
  const pixelSize = 5;
  const previousCloudNoiseRef = useRef<number[][] | null>(null);
  const newCloudNoiseRef = useRef<number[][] | null>(null);
  const blendFactorRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const noiseScale = 30;

  // Movement speeds for cloud animation
  const movementSpeedX = 0.001;
  const movementSpeedY = 0.0005;

 // Tracks data as state
 const [tracks, setTracks] = useState([
  { albumCover: "", artistName: "Artist 1", albumName: "Album 1", year: 2021, trackName: "Track 1", duration: "3:30", audioFile: "/audio/track1.mp3" },
  { albumCover: "", artistName: "Artist 2", albumName: "Album 2", year: 2020, trackName: "Track 2", duration: "4:00", audioFile: "/audio/track2.mp3" },
  { albumCover: "", artistName: "Artist 3", albumName: "Album 3", year: 2019, trackName: "Track 3", duration: "2:45", audioFile: "/audio/track3.mp3" },
]);

  const [activeTrackIndex, setActiveTrackIndex] = useState(0); // State for active track index

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.ceil(canvas.width / pixelSize);
    const rows = Math.ceil(canvas.height / pixelSize);

    previousCloudNoiseRef.current = generatePerlinNoise(cols, rows, noiseScale, Math.floor(timeOffsetXRef.current), Math.floor(timeOffsetYRef.current));
    newCloudNoiseRef.current = [...previousCloudNoiseRef.current];

    const animate = (timestamp: number) => {
      const timeElapsed = timestamp - lastUpdateTimeRef.current;
      timeOffsetXRef.current += movementSpeedX * (timeElapsed / 1000);
      timeOffsetYRef.current += movementSpeedY * (timeElapsed / 1000);

      if (timeElapsed > 3500) {
        newCloudNoiseRef.current = generatePerlinNoise(cols, rows, noiseScale, Math.floor(timeOffsetXRef.current), Math.floor(timeOffsetYRef.current));
        lastUpdateTimeRef.current = timestamp;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      blendFactorRef.current += timeElapsed / 6000;
      if (blendFactorRef.current > 1) blendFactorRef.current = 1;

      createPixelatedSky(ctx, canvas.width, canvas.height, pixelSize, previousCloudNoiseRef.current!, newCloudNoiseRef.current!, blendFactorRef.current);

      if (blendFactorRef.current === 1) {
        previousCloudNoiseRef.current = newCloudNoiseRef.current;
        blendFactorRef.current = 0;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      timeOffsetXRef.current = 0;
      timeOffsetYRef.current = 0;
      lastUpdateTimeRef.current = performance.now();
      const cols = Math.ceil(canvas.width / pixelSize);
      const rows = Math.ceil(canvas.height / pixelSize);
      previousCloudNoiseRef.current = generatePerlinNoise(cols, rows, noiseScale, 0, 0);
      newCloudNoiseRef.current = [...previousCloudNoiseRef.current];
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Extract the active track using the activeTrackIndex
  const activeTrack = tracks[activeTrackIndex];

  return (
    <div className="w-full h-screen relative overflow-hidden flex flex-col" style={{ zIndex: 1 }}>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }} // Ensure canvas is behind other elements
      ></canvas>
      <div style={{ padding: '20px', zIndex: 2, position: 'relative' }}>
        {/* Display only the active track */}
        <TrackItem 
          albumCover={activeTrack.albumCover} // Use the active track's album cover
          trackName={activeTrack.trackName} // Use the active track's name
          artistName={activeTrack.artistName} // Use the active track's artist name
          duration={activeTrack.duration}
          audioFile={activeTrack.audioFile} // Use the active track's duration
          isActive={true} // Indicate that this is the active track
        />
      </div>
      <div style={{ padding: '20px', zIndex: 2, position: 'relative' }}>
        <Playlist 
          tracks={tracks} 
          activeTrackIndex={activeTrackIndex} 
          setActiveTrackIndex={setActiveTrackIndex} 
          setTracks={setTracks} // Pass down setTracks function to update state
        />
      </div>
    </div>
  );
}