# TeslaCam Video Player

A modern web application for viewing TeslaCam videos from Dashcam or Sentry Mode, similar to [sentrycam.video](https://sentrycam.video/). Built with Node.js and vanilla JavaScript.

## Features

- **Multi-camera video playback** - View front, left, right, and rear camera feeds simultaneously
- **Drag & drop file selection** - Easy file loading with visual feedback
- **Event-based organization** - Automatically groups videos by timestamp/incident
- **Playback controls** - Play/pause, speed adjustment (0.5x to 4x), timeline scrubbing
- **Event navigation** - Jump between different incidents with dropdown selection
- **Responsive design** - Works on desktop and mobile devices
- **Click to enlarge** - Focus on individual camera feeds
- **Local file processing** - No uploads, all processing happens in your browser
- **Memory efficient** - Uses object URLs for optimal performance

## Prerequisites

- Node.js (version 14 or higher)
- Modern web browser (Safari or Firefox recommended for H.265 videos)
- TeslaCam USB drive with video files

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd tesla-cam-player
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Development

For development with auto-restart on file changes:
```bash
npm run dev
```

## Usage

### Loading Videos

1. **Insert your TeslaCam USB drive** into your computer
2. **Browse for files** - Click the "Browse Files" button and select:
   - Individual video files
   - TeslaCam directory
   - RecentClips, SavedClips, or SentryClips subdirectories
3. **Drag & drop** - Alternatively, drag video files directly onto the upload area

### Video Playback

- **Play/Pause** - Use the play button or spacebar
- **Speed control** - Click speed buttons (0.5x, 1x, 2x, 4x)
- **Timeline scrubbing** - Drag the timeline slider to jump to specific times
- **Event navigation** - Use Previous/Next buttons or the event dropdown
- **Jump to event** - For Sentry Mode events, jump to the critical moment

### Camera Views

- **Side-by-side layout** - All cameras display simultaneously
- **Click to enlarge** - Click any camera video to focus on it
- **Click again** - Return to side-by-side layout

## File Structure

```
tesla-cam-player/
├── server.js              # Express server
├── package.json           # Dependencies and scripts
├── README.md             # This file
└── public/               # Static files
    ├── index.html        # Main HTML page
    ├── css/
    │   └── styles.css    # Application styles
    └── js/
        └── app.js        # Main application logic
```

## Supported Video Formats

- MP4 (H.264, H.265/HEVC)
- MOV
- AVI
- MKV

**Note:** H.265/HEVC videos (common in newer Tesla models) work best in Safari or Firefox browsers.

## Browser Compatibility

- **Safari** - Best support for H.265 videos
- **Firefox** - Good support for H.265 videos
- **Chrome** - Limited H.265 support (may need extensions)
- **Edge** - Limited H.265 support (may need extensions)

## TeslaCam File Naming

The application automatically detects camera types based on common TeslaCam naming patterns:

- **Front camera**: `*front*`, `*f_*`, `*_f_*`
- **Left camera**: `*left*`, `*l_*`, `*_l_*`
- **Right camera**: `*right*`, `*r_*`, `*_r_*`
- **Rear camera**: `*back*`, `*rear*`, `*b_*`, `*_b_*`

## Event Detection

Videos are automatically grouped into events based on:
- Timestamp proximity (within 1 minute)
- File naming patterns
- Typical TeslaCam clip durations

## Troubleshooting

### Videos won't play
- Ensure you're using a compatible browser (Safari/Firefox for H.265)
- Check that video files are not corrupted
- Try refreshing the page and reloading files

### Poor performance
- Close other browser tabs/applications
- Reduce the number of simultaneous video files
- Use lower playback speeds

### Camera detection issues
- Ensure video files follow TeslaCam naming conventions
- Manually rename files if needed to include camera identifiers

## API Endpoints

- `GET /` - Main application page
- `GET /api/health` - Health check endpoint
- `GET /api/files?directory=<path>` - List video files in directory

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- Inspired by [sentrycam.video](https://sentrycam.video/)
- Built for Tesla owners to easily view their dashcam and sentry footage
- Uses Font Awesome for icons
- Modern CSS Grid and Flexbox for responsive layouts

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure you're using a compatible browser
3. Verify your TeslaCam files are properly formatted
4. Check the browser console for error messages

---

**Note:** This application is not affiliated with Tesla Motors, Inc. TESLA and TESLA MOTORS are trademarks of Tesla Motors, Inc. 