// src/app/api/tracks/route.js
import fs from 'fs';
import path from 'path';
import mm from 'music-metadata';

export async function GET() {
  const audioDir = path.join(process.cwd(), 'public/audio');
  
  try {
    const files = fs.readdirSync(audioDir);
    const tracks = [];

    for (const file of files) {
      if (file.endsWith('.mp3') || file.endsWith('.wav') || file.endsWith('.flac')) { // Add other formats as needed
        const filePath = path.join(audioDir, file);
        const metadata = await mm.parseFile(filePath);
        
        tracks.push({
          albumCover: metadata.common.picture ? `data:${metadata.common.picture[0].format};base64,${metadata.common.picture[0].data.toString('base64')}` : '',
          artistName: metadata.common.artist || 'Unknown Artist',
          albumName: metadata.common.album || 'Unknown Album',
          year: metadata.common.year || 'Unknown Year',
          trackName: metadata.common.title || 'Unknown Title',
          duration: metadata.format.duration ? `${Math.floor(metadata.format.duration / 60)}:${Math.floor(metadata.format.duration % 60).toString().padStart(2, '0')}` : '0:00',
          audioFile: `/audio/${file}`, // Path to play the audio file
        });
      }
    }

    return new Response(JSON.stringify(tracks), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error reading audio files:', error); // Log specific error
    return new Response(JSON.stringify({ error: 'Failed to read audio files' }), { status: 500 });
  }
}