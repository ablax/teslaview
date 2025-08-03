# TeslaCam Video Player

A modern web application for viewing, editing, and creating custom clips from TeslaCam videos from Dashcam or Sentry Mode, similar to [sentrycam.video](https://sentrycam.video/). Built with Node.js and vanilla JavaScript.

## 🌐 Live Demo

**Try it now:** [https://teslaview.vercel.app/](https://teslaview.vercel.app/)

The application is deployed and ready to use! Simply visit the link above to start viewing and editing your TeslaCam videos.

## Features

### Progressive Web App (PWA)
- **Offline functionality** - App interface works without internet after first visit
- **Installable** - Add to home screen like a native app
- **Automatic caching** - App resources (HTML, CSS, JS) cached for offline use
- **Update notifications** - Get notified when new versions are available
- **App-like experience** - Full-screen mode without browser UI
- **Cross-platform** - Works on desktop, mobile, and tablets

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

### Event Combination System
- **Multi-event selection** - Select multiple events to combine into longer videos
- **Intuitive dropdown interface** - Checkbox dropdown for easy event selection
- **Bulk operations** - Select all/none events with single clicks
- **Camera-specific downloads** - Download combined events for specific cameras
- **Seamless transitions** - No delays between event segments in combined videos
- **Smart event grouping** - Automatically detects and groups related events

### Performance Optimizations
- **WebCodecs API support** - Hardware-accelerated video processing when available
- **Automatic fallback** - Falls back to Canvas/MediaRecorder for compatibility
- **Production mode** - Toggle console logging for development/production
- **Optimized video processing** - Faster video combining and splicing
- **Memory management** - Automatic cleanup of video elements and object URLs

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

### Production Mode
Toggle console logging by changing `this.isProduction` in the constructor:
```javascript
// In public/js/app.js constructor
this.isProduction = false; // Development mode - shows console logs
this.isProduction = true;  // Production mode - hides console logs
```

## Usage

### Quick Start

**Option 1: Use the Live Demo**
- Visit [https://teslaview.vercel.app/](https://teslaview.vercel.app/)
- No installation required - works directly in your browser
- **PWA Installation**: Click the install prompt or use browser's "Add to Home Screen" option

**Option 2: Run Locally**
- Follow the installation instructions below
- **Offline Mode**: After first visit, the app interface works without internet connection

### Loading Videos

1. **Insert your TeslaCam USB drive** into your computer
2. **Browse for files** - Click the "Select Video Files" button and select:
   - Individual video files
   - TeslaCam directory
   - RecentClips, SavedClips, or SentryClips subdirectories
3. **Select directory** - Use "Select Directory" for entire folder loading
4. **Drag & drop** - Alternatively, drag video files or folders directly onto the upload area

**💡 Offline Tip**: The app interface and resources are cached for offline use. You can disconnect from the internet and still access the app, but you'll need to reload your video files when you go offline.

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

### Event Combination

#### Combining Multiple Events
1. **Load your TeslaCam files** - The app will automatically group videos into events
2. **Enter event selection mode** - Click "Select Events" button
3. **Choose events** - Use the dropdown to select events you want to combine:
   - **Dropdown interface** - Click "Select Events" to open the dropdown
   - **Checkbox selection** - Check individual events or use "Select All"/"Select None"
   - **Event information** - See video count, camera count, and timestamps
4. **Combine events** - Click "Combine Events" to create a combined event
5. **Download combined video** - Use camera-specific download buttons

#### Event Selection Interface
- **Intuitive dropdown** - Compact interface for selecting from many events
- **Bulk operations** - Select all events or clear all selections
- **Real-time feedback** - See selection count in dropdown button
- **Event details** - View video count, camera count, and timestamps
- **Persistent selection** - Dropdown stays open during selection

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
    ├── js/
    │   └── app.js        # Main application logic
    ├── manifest.json     # PWA manifest
    ├── sw.js            # Service worker
    └── icons/           # PWA icons
```

## Supported Video Formats

- MP4 (H.264, H.265/HEVC)
- MOV
- AVI
- MKV

**Note:** H.265/HEVC videos (common in newer Tesla models) work best in Safari or Firefox browsers.

## Browser Compatibility

- **Safari** - Best support for H.265 videos, video recording, and PWA features
- **Firefox** - Good support for H.265 videos, video recording, and PWA features
- **Chrome** - Limited H.265 support (may need extensions), good video recording and PWA features
- **Edge** - Limited H.265 support (may need extensions), good video recording and PWA features

### PWA Support
- **Installation**: All modern browsers support PWA installation
- **Offline mode**: Works in all browsers with service worker support
- **App-like experience**: Full-screen mode available on all platforms

### WebCodecs Support
- **Safari**: Full WebCodecs support for hardware acceleration
- **Chrome**: Full WebCodecs support (version 94+)
- **Firefox**: Limited WebCodecs support
- **Fallback**: Automatic fallback to Canvas/MediaRecorder for compatibility

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
- **Hidden video processing** - Uses dedicated video elements for accurate splicing

### Combining System
- **Multi-clip selection** - Choose any number of clips to combine
- **Multi-event selection** - Combine entire events into longer videos
- **Camera grouping** - Combines clips by camera type
- **Sequential processing** - Plays each clip segment in order
- **Single output** - Creates one continuous video file
- **Seamless transitions** - No delays between segments

### Download System
- **MP4 format** - High-quality video output
- **Smart naming** - Clear file names with clip info
- **Individual cameras** - Download specific camera feeds
- **Combined videos** - Download merged clips as single files
- **WebCodecs optimization** - Hardware-accelerated processing when available

## Performance Features

### WebCodecs Integration
- **Hardware acceleration** - Uses GPU for video processing when available
- **Automatic detection** - Checks for WebCodecs API support
- **Graceful fallback** - Falls back to Canvas/MediaRecorder if not supported
- **Optimized encoding** - Prioritizes MP4 format with high bitrates
- **Faster processing** - Significantly faster video combining and splicing

### Production Mode
- **Development mode** - Full console logging for debugging
- **Production mode** - Clean console output for end users
- **Easy toggle** - Single line change to switch modes
- **Performance optimization** - No logging overhead in production

## Troubleshooting

### PWA Installation Issues
- **Install prompt not showing**: Check browser console for PWA requirements
- **Icons not loading**: Ensure all icon files are accessible
- **Service worker not registering**: Check for HTTPS/localhost requirement
- **Manual installation**: Use browser's "Add to Home Screen" option

### Videos won't play
- Ensure you're using a compatible browser (Safari/Firefox for H.265)
- Check that video files are not corrupted
- Try refreshing the page and reloading files

### Poor performance
- Close other browser tabs/applications
- Reduce the number of simultaneous video files
- Use lower playback speeds
- Check if WebCodecs is available in your browser

### Camera detection issues
- Ensure video files follow TeslaCam naming conventions
- Manually rename files if needed to include camera identifiers

### Splicing issues
- Make sure start time is before end time
- Check that videos are fully loaded before splicing
- Try refreshing the page if splicing controls don't respond
- Ensure you're using the correct video (not currently displayed event)

### Download issues
- Ensure browser supports MediaRecorder API
- Check browser permissions for file downloads
- Try using Safari or Firefox for best compatibility
- Check if WebCodecs is available for faster processing

### Event combination issues
- Ensure you've selected at least 2 events to combine
- Check that events contain videos for the camera you're trying to download
- Try refreshing the page if event selection doesn't work
- Use the dropdown interface for easier event selection

### Offline Mode Issues
- **App not working offline**: Ensure you've visited the site at least once while online
- **App resources not loading**: Check browser storage permissions
- **Service worker not updating**: Clear browser cache and reload

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
- Progressive Web App (PWA) technology for offline functionality
- WebCodecs API for hardware-accelerated video processing

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Ensure you're using a compatible browser
3. Verify your TeslaCam files are properly formatted
4. Check the browser console for error messages
5. Test video editing features with shorter clips first
6. For PWA issues, check browser console for installability requirements
7. For performance issues, check WebCodecs support in your browser

### Offline Usage
- **First visit**: Always visit the site once while online to cache app resources
- **Subsequent visits**: App interface works offline with cached resources
- **Video processing**: All video editing works offline once videos are loaded
- **Video files**: Must be reloaded when going offline (not cached by service worker)
- **Updates**: App will notify you when new versions are available

### Performance Tips
- **Use WebCodecs**: Enable hardware acceleration for faster video processing
- **Browser choice**: Use Safari or Firefox for best H.265 support
- **Memory management**: Close other tabs when processing large videos
- **Production mode**: Enable production mode for optimal performance

## Live Demo

**Try the application online:** [https://teslaview.vercel.app/](https://teslaview.vercel.app/)

The live demo is fully functional and supports all features including video splicing, combining, event combination, and downloading.

---

**Note:** This application is not affiliated with Tesla Motors, Inc. TESLA and TESLA MOTORS are trademarks of Tesla Motors, Inc. 