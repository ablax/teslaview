# TeslaCam Video Player

A modern web application for viewing, editing, and creating custom clips from TeslaCam videos from Dashcam or Sentry Mode, similar to [sentrycam.video](https://sentrycam.video/). Built with Node.js and vanilla JavaScript.

## 🌐 Live Demo

**Try it now:** [https://teslaview.vercel.app/](https://teslaview.vercel.app/)

The application is deployed and ready to use! Simply visit the link above to start viewing and editing your TeslaCam videos.

## Features

### Core Video Playback
- **Multi-camera video playback** - View front, left, right, and rear camera feeds simultaneously
- **Drag & drop file selection** - Easy file loading with visual feedback
- **Event-based organization** - Automatically groups videos by timestamp/incident
- **Playback controls** - Play/pause, speed adjustment (0.5x to 4x), timeline scrubbing
- **Event navigation** - Jump between different incidents with dropdown selection
- **Responsive design** - Works on desktop and mobile devices
- **Click to enlarge** - Focus on individual camera feeds
- **Local file processing** - No uploads, all processing happens in your browser
- **Memory efficient** - Uses object URLs for optimal performance

### Advanced Video Editing
- **Video splicing** - Create custom clips by setting start and end times
- **Timeline controls** - Set precise start/end points for clips
- **Custom clip management** - Organize and view all your created clips
- **Multi-clip combining** - Select and merge multiple clips into longer videos
- **Individual camera downloads** - Download specific camera feeds from any clip
- **MP4 export** - Download clips in high-quality MP4 format
- **Clip selection mode** - Easily select multiple clips for combining

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

**Or use the live demo:** [https://teslaview.vercel.app/](https://teslaview.vercel.app/)

## Development

For development with auto-restart on file changes:
```bash
npm run dev
```

## Usage

### Quick Start

**Option 1: Use the Live Demo**
- Visit [https://teslaview.vercel.app/](https://teslaview.vercel.app/)
- No installation required - works directly in your browser

**Option 2: Run Locally**
- Follow the installation instructions below

### Loading Videos

1. **Insert your TeslaCam USB drive** into your computer
2. **Browse for files** - Click the "Select Video Files" button and select:
   - Individual video files
   - TeslaCam directory
   - RecentClips, SavedClips, or SentryClips subdirectories
3. **Select directory** - Use "Select Directory" for entire folder loading
4. **Drag & drop** - Alternatively, drag video files or folders directly onto the upload area

### Video Playback

- **Play/Pause** - Use the play button or spacebar
- **Speed control** - Click speed buttons (0.5x, 1x, 2x, 4x)
- **Timeline scrubbing** - Drag the timeline slider to jump to specific times
- **Event navigation** - Use Previous/Next buttons or the event dropdown
- **Jump to event** - For Sentry Mode events, jump to the critical moment

### Video Splicing & Editing

#### Creating Custom Clips
1. **Navigate to an event** with the video you want to edit
2. **Play the video** and find the section you want to clip
3. **Set start time** - Click "Set Start" at the beginning of your desired clip
4. **Set end time** - Click "Set End" at the end of your desired clip
5. **Create splice** - Click "Splice Clip" to create a custom clip
6. **View your clip** - The new clip appears in the "Custom Clips" section

#### Managing Custom Clips
- **Clip counter** - Shows total number of custom clips created
- **Clip information** - Duration, time range, and camera count
- **Individual downloads** - Download buttons for each camera (Front, Left, Right, Rear)
- **MP4 format** - All downloads are in high-quality MP4 format

#### Combining Multiple Clips
1. **Create several spliced clips** using the process above
2. **Enter selection mode** - Click "Select Clips" button
3. **Choose clips** - Check the clips you want to combine
4. **Combine clips** - Click "Combine Selected" to merge them
5. **Download combined video** - Use the download buttons for the combined clip

### Camera Views

- **Side-by-side layout** - All cameras display simultaneously
- **Click to enlarge** - Click any camera video to focus on it
- **Click again** - Return to side-by-side layout
- **Download individual cameras** - Download specific camera feeds

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

- **Safari** - Best support for H.265 videos and video recording
- **Firefox** - Good support for H.265 videos and video recording
- **Chrome** - Limited H.265 support (may need extensions), good video recording
- **Edge** - Limited H.265 support (may need extensions), good video recording

## TeslaCam File Naming

The application automatically detects camera types based on common TeslaCam naming patterns:

- **Front camera**: `*front*`, `*f_*`, `*_f_*`
- **Left camera**: `*left*`, `*l_*`, `*_l_*`
- **Right camera**: `*right*`, `*r_*`, `*_r_*`
- **Rear camera**: `*back*`, `*rear*`, `*b_*`, `*_b_*`
- **Additional cameras**: `*top*`, `*bottom*`, `*center*`, `*side*`

## Event Detection

Videos are automatically grouped into events based on:
- Timestamp proximity (within 1 minute)
- File naming patterns
- Typical TeslaCam clip durations
- Hidden file filtering (macOS ._ files)

## Video Editing Features

### Splicing System
- **Precise timing** - Set exact start/end times for clips
- **Multi-camera support** - Creates clips for all cameras simultaneously
- **Visual feedback** - Clear indication of selected times
- **Error handling** - Validates start/end times and selection

### Combining System
- **Multi-clip selection** - Choose any number of clips to combine
- **Camera grouping** - Combines clips by camera type
- **Sequential processing** - Plays each clip segment in order
- **Single output** - Creates one continuous video file

### Download System
- **MP4 format** - High-quality video output
- **Smart naming** - Clear file names with clip info
- **Individual cameras** - Download specific camera feeds
- **Combined videos** - Download merged clips as single files

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

### Splicing issues
- Make sure start time is before end time
- Check that videos are fully loaded before splicing
- Try refreshing the page if splicing controls don't respond

### Download issues
- Ensure browser supports MediaRecorder API
- Check browser permissions for file downloads
- Try using Safari or Firefox for best compatibility

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
- Built for Tesla owners to easily view, edit, and create custom clips from their dashcam and sentry footage
- Uses Font Awesome for icons
- Modern CSS Grid and Flexbox for responsive layouts
- HTML5 Canvas and MediaRecorder API for video processing

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure you're using a compatible browser
3. Verify your TeslaCam files are properly formatted
4. Check the browser console for error messages
5. Test video editing features with shorter clips first

## Live Demo

**Try the application online:** [https://teslaview.vercel.app/](https://teslaview.vercel.app/)

The live demo is fully functional and supports all features including video splicing, combining, and downloading.

---

**Note:** This application is not affiliated with Tesla Motors, Inc. TESLA and TESLA MOTORS are trademarks of Tesla Motors, Inc. 