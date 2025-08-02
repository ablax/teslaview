# Changelog

All notable changes to TeslaCam Video Player will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Add location information support
- Create merged camera video feature
- Offline support improvements
- Enhanced mobile experience

## [1.0.0] - 2025-01-XX

### Added
- **Core Video Playback**
  - Multi-camera video playback (Front, Left, Right, Rear)
  - Drag & drop file selection with visual feedback
  - Event-based organization with automatic grouping
  - Playback controls (play/pause, speed adjustment 0.5x to 4x)
  - Timeline scrubbing and navigation
  - Event navigation with dropdown selection
  - Responsive design for desktop and mobile
  - Click to enlarge individual camera feeds
  - Local file processing (no uploads)
  - Memory efficient object URL usage

- **Advanced Video Editing**
  - Video splicing with precise start/end time controls
  - Timeline controls (Set Start, Set End, Splice Clip)
  - Custom clip management and organization
  - Multi-clip combining with selection mode
  - Individual camera downloads for each clip
  - MP4 export in high-quality format
  - Clip selection mode for easy multi-clip selection

- **File Management**
  - Support for TeslaCam, RecentClips, SavedClips, SentryClips directories
  - Directory selection and drag-and-drop support
  - Hidden file filtering (macOS ._ files)
  - Multiple video format support (MP4, MOV, AVI, MKV)
  - H.264 and H.265/HEVC codec support

- **User Interface**
  - Modern, responsive design
  - Professional styling with CSS Grid and Flexbox
  - Font Awesome icons
  - Download overlay with file information
  - Custom clips section with grid layout
  - Timeline controls with visual feedback
  - Event counter and file counter displays

- **Technical Features**
  - Node.js Express server
  - Vanilla JavaScript frontend
  - HTML5 Canvas and MediaRecorder API for video processing
  - Browser compatibility optimization
  - Error handling and validation
  - Console logging for debugging

### Technical Details
- **Backend**: Node.js with Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Video Processing**: HTML5 Canvas, MediaRecorder API
- **File Handling**: File API, Drag & Drop API
- **Styling**: CSS Grid, Flexbox, responsive design
- **Icons**: Font Awesome 6.0.0

### Browser Support
- **Safari**: Best support for H.265 videos and video recording
- **Firefox**: Good support for H.265 videos and video recording  
- **Chrome**: Limited H.265 support, good video recording
- **Edge**: Limited H.265 support, good video recording

### Dependencies
- express: ^4.18.2
- cors: ^2.8.5
- multer: ^1.4.5-lts.1
- path: ^0.12.7
- fs: ^0.0.1-security
- nodemon: ^3.0.1 (dev dependency)

## [0.1.0] - 2025-01-XX

### Added
- Initial project setup
- Basic Node.js server structure
- Basic HTML/CSS/JavaScript foundation
- File upload functionality
- Video playback basics

---

## Version History

### Version 1.0.0
- Complete TeslaCam Video Player with advanced editing features
- Video splicing and combining capabilities
- Professional UI/UX design
- Comprehensive documentation
- GitHub project structure with proper licensing

### Version 0.1.0
- Initial development version
- Basic functionality implementation

---

## Contributing

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by [sentrycam.video](https://sentrycam.video) - the original TeslaCam web player
- Built for Tesla owners to easily view, edit, and create custom clips from their dashcam and sentry footage
- Uses Font Awesome for icons
- Modern CSS Grid and Flexbox for responsive layouts
- HTML5 Canvas and MediaRecorder API for video processing 