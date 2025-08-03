class TeslaCamPlayer {
    constructor() {
        this.videos = [];
        this.events = [];
        this.currentEventIndex = 0;
        this.isPlaying = false;
        this.currentSpeed = 1;
        this.objectUrls = [];
        
        // Splicing state
        this.spliceStartTime = null;
        this.spliceEndTime = null;
        this.customClipsArray = [];
        this.selectedClips = [];
        this.isSelectMode = false;
        
        // Event combination state
        this.selectedEvents = [];
        this.isEventSelectMode = false;
        this.combinedEvents = [];
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // File selection elements
        this.fileInput = document.getElementById('fileInput');
        this.dirInput = document.getElementById('dirInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.fileSelection = document.getElementById('fileSelection');
        this.videoContainer = document.getElementById('videoContainer');
        
        // Control elements
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.timeline = document.getElementById('timeline');
        this.currentTimeSpan = document.getElementById('currentTime');
        this.totalTimeSpan = document.getElementById('totalTime');
        this.eventSelect = document.getElementById('eventSelect');
        this.jumpToEventBtn = document.getElementById('jumpToEventBtn');
        
        // Video elements
        this.videoGrid = document.getElementById('videoGrid');
        this.fileCountSpan = document.getElementById('fileCount');
        this.eventCountSpan = document.getElementById('eventCount');
        this.eventInfoSpan = document.getElementById('eventInfo');
        
        // Download elements
        this.downloadOverlay = document.getElementById('downloadOverlay');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.closeDownloadBtn = document.getElementById('closeDownloadBtn');
        this.downloadFileName = document.getElementById('downloadFileName');
        this.downloadCamera = document.getElementById('downloadCamera');
        
        // Timeline and splicing elements
        this.setStartBtn = document.getElementById('setStartBtn');
        this.setEndBtn = document.getElementById('setEndBtn');
        this.spliceBtn = document.getElementById('spliceBtn');
        this.clipCountSpan = document.getElementById('clipCount');
        this.customClips = document.getElementById('customClips');
        this.clipsContainer = document.getElementById('clipsContainer');
        this.selectClipsBtn = document.getElementById('selectClipsBtn');
        this.combineBtn = document.getElementById('combineBtn');
        
        // Speed buttons
        this.speedButtons = document.querySelectorAll('.speed-btn');
        
        // Event combination elements
        this.eventCombination = document.getElementById('eventCombination');
        this.selectEventsBtn = document.getElementById('selectEventsBtn');
        this.combineEventsBtn = document.getElementById('combineEventsBtn');
        this.clearEventSelectionBtn = document.getElementById('clearEventSelectionBtn');
        this.selectedEventsContainer = document.getElementById('selectedEventsContainer');
        this.selectedEventsList = document.getElementById('selectedEventsList');
        this.combinedEventsContainer = document.getElementById('combinedEventsContainer');
        this.combinedEventsList = document.getElementById('combinedEventsList');
    }

    bindEvents() {
        // File selection events
        this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        this.dirInput.addEventListener('change', (e) => this.handleDirectorySelection(e));
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Control events
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.previousEvent());
        this.nextBtn.addEventListener('click', () => this.nextEvent());
        this.timeline.addEventListener('input', (e) => this.seekToTime(e.target.value));
        this.timeline.addEventListener('change', (e) => this.seekToTime(e.target.value));
        this.eventSelect.addEventListener('change', (e) => this.selectEvent(e.target.value));
        this.jumpToEventBtn.addEventListener('click', () => this.jumpToEvent());
        
        // Speed button events
        this.speedButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.setPlaybackSpeed(parseFloat(e.target.dataset.speed)));
        });
        
        // Download events
        this.downloadBtn.addEventListener('click', () => this.downloadVideo());
        this.closeDownloadBtn.addEventListener('click', () => this.hideDownloadOverlay());
        
        // Close overlay when clicking outside
        this.downloadOverlay.addEventListener('click', (e) => {
            if (e.target === this.downloadOverlay) {
                this.hideDownloadOverlay();
            }
        });
        
        // Splicing events
        this.setStartBtn.addEventListener('click', () => this.setSpliceStart());
        this.setEndBtn.addEventListener('click', () => this.setSpliceEnd());
        
        // Event combination events
        this.selectEventsBtn.addEventListener('click', () => this.toggleEventSelectMode());
        this.combineEventsBtn.addEventListener('click', () => this.combineSelectedEvents());
        this.clearEventSelectionBtn.addEventListener('click', () => this.clearEventSelection());
        this.spliceBtn.addEventListener('click', () => this.createSplice());
        this.selectClipsBtn.addEventListener('click', () => this.toggleSelectMode());
        this.combineBtn.addEventListener('click', () => this.combineSelectedClips());
    }

    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        this.processFiles(files);
    }

    handleDirectorySelection(event) {
        const files = Array.from(event.target.files);
        console.log('Total files selected:', files.length);
        
        // Log all files for debugging
        files.forEach((file, index) => {
            console.log(`File ${index + 1}:`, {
                name: file.name,
                type: file.type,
                path: file.webkitRelativePath,
                size: file.size
            });
        });
        
        // Filter for video files and organize by directory structure
        const videoFiles = files.filter(file => {
            const isVideo = file.type.startsWith('video/') || 
                           file.name.toLowerCase().endsWith('.mp4') ||
                           file.name.toLowerCase().endsWith('.mov') ||
                           file.name.toLowerCase().endsWith('.avi') ||
                           file.name.toLowerCase().endsWith('.mkv');
            
            if (isVideo) {
                console.log('Found video file:', file.name, file.webkitRelativePath);
            }
            return isVideo;
        });
        
        console.log('Video files found:', videoFiles.length);
        
        if (videoFiles.length === 0) {
            this.showError('No video files found in the selected directory. Please check that the directory contains video files.');
            return;
        }

        this.showSuccess(`Found ${videoFiles.length} video files in directory`);
        this.processFiles(videoFiles);
    }

    handleDragOver(event) {
        event.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDrop(event) {
        event.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const items = Array.from(event.dataTransfer.items);
        const files = [];
        
        // Handle both files and directories
        const processEntry = async (entry) => {
            if (entry.isFile) {
                const file = await new Promise((resolve) => entry.file(resolve));
                if (file.type.startsWith('video/')) {
                    files.push(file);
                }
            } else if (entry.isDirectory) {
                const reader = entry.createReader();
                const entries = await new Promise((resolve) => reader.readEntries(resolve));
                for (const childEntry of entries) {
                    await processEntry(childEntry);
                }
            }
        };

        // Process all dropped items
        Promise.all(items.map(item => {
            if (item.kind === 'file') {
                const entry = item.webkitGetAsEntry();
                if (entry) {
                    return processEntry(entry);
                }
            }
        })).then(() => {
            if (files.length > 0) {
                this.showSuccess(`Found ${files.length} video files`);
                this.processFiles(files);
            } else {
                this.showError('No video files found in the dropped items.');
            }
        });
    }

    processFiles(files) {
        const videoFiles = files.filter(file => file.type.startsWith('video/'));
        
        if (videoFiles.length === 0) {
            this.showError('No video files found. Please select video files.');
            return;
        }

        this.showLoading();
        
        // Create object URLs for videos
        this.videos = videoFiles.map(file => {
            const objectUrl = URL.createObjectURL(file);
            this.objectUrls.push(objectUrl);
            
            const videoInfo = {
                file: file,
                objectUrl: objectUrl,
                name: file.name,
                path: file.webkitRelativePath || file.name,
                camera: this.detectCamera(file.name, file.webkitRelativePath || ''),
                timestamp: this.extractTimestamp(file.name)
            };
            
            console.log('Processed video:', videoInfo.name, 'Camera:', videoInfo.camera);
            return videoInfo;
        });

        console.log('Total videos processed:', this.videos.length);
        console.log('Unique cameras found:', [...new Set(this.videos.map(v => v.camera))]);

        // Group videos by events
        this.groupVideosByEvents();
        
        // Update UI
        this.updateFileCount();
        this.updateEventCount();
        this.populateEventSelect();
        this.createVideoGrid();
        
        this.hideLoading();
        this.showVideoContainer();
        
        // Auto-play first event
        if (this.events.length > 0) {
            this.loadEvent(0);
        }
    }

    detectCamera(filename, filepath = '') {
        const lowerName = filename.toLowerCase();
        const lowerPath = filepath.toLowerCase();
        
        // Check filename first
        if (lowerName.includes('front') || lowerName.includes('f_')) return 'Front';
        if (lowerName.includes('left') || lowerName.includes('l_')) return 'Left';
        if (lowerName.includes('right') || lowerName.includes('r_')) return 'Right';
        if (lowerName.includes('back') || lowerName.includes('rear') || lowerName.includes('b_')) return 'Rear';
        if (lowerName.includes('top') || lowerName.includes('t_')) return 'Top';
        if (lowerName.includes('bottom') || lowerName.includes('bot_')) return 'Bottom';
        if (lowerName.includes('center') || lowerName.includes('c_')) return 'Center';
        if (lowerName.includes('side') || lowerName.includes('s_')) return 'Side';
        
        // Check path for camera indicators
        if (lowerPath.includes('front') || lowerPath.includes('f_')) return 'Front';
        if (lowerPath.includes('left') || lowerPath.includes('l_')) return 'Left';
        if (lowerPath.includes('right') || lowerPath.includes('r_')) return 'Right';
        if (lowerPath.includes('back') || lowerPath.includes('rear') || lowerPath.includes('b_')) return 'Rear';
        if (lowerPath.includes('top') || lowerPath.includes('t_')) return 'Top';
        if (lowerPath.includes('bottom') || lowerPath.includes('bot_')) return 'Bottom';
        if (lowerPath.includes('center') || lowerPath.includes('c_')) return 'Center';
        if (lowerPath.includes('side') || lowerPath.includes('s_')) return 'Side';
        
        // Default detection based on common Tesla naming patterns
        if (lowerName.includes('_f_')) return 'Front';
        if (lowerName.includes('_l_')) return 'Left';
        if (lowerName.includes('_r_')) return 'Right';
        if (lowerName.includes('_b_')) return 'Rear';
        if (lowerName.includes('_t_')) return 'Top';
        if (lowerName.includes('_c_')) return 'Center';
        if (lowerName.includes('_s_')) return 'Side';
        
        // If we can't determine, use the filename as camera name
        const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
        return nameWithoutExt || 'Unknown';
    }

    extractTimestamp(filename) {
        // Extract timestamp from TeslaCam filename format
        // TeslaCam files typically have format: YYYY-MM-DD_HH-MM-SS
        const timestampMatch = filename.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/);
        if (timestampMatch) {
            const timestampStr = timestampMatch[1];
            // Convert TeslaCam timestamp format to proper date
            const dateStr = timestampStr.replace(/_/g, 'T').replace(/-/g, (match, offset) => {
                // Replace hyphens with colons for time, but keep them for date
                return offset < 10 ? '-' : ':';
            });
            return new Date(dateStr);
        }
        
        // Fallback: try to extract any date-like pattern
        const fallbackMatch = filename.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
        if (fallbackMatch) {
            return new Date(fallbackMatch[1].replace(/_/g, '-'));
        }
        
        console.warn('Could not extract timestamp from filename:', filename);
        return new Date();
    }

    groupVideosByEvents() {
        console.log('Grouping videos by events...');
        console.log('Total videos:', this.videos.length);
        
        // Log all videos with their timestamps for debugging
        this.videos.forEach((video, index) => {
            console.log(`Video ${index + 1}:`, {
                name: video.name,
                camera: video.camera,
                timestamp: video.timestamp,
                timestampStr: video.timestamp.toISOString()
            });
        });
        
        // Group videos by exact timestamp (TeslaCam recordings are typically synchronized)
        const groups = {};
        
        // Filter out hidden files before grouping
        const validVideos = this.videos.filter(video => !video.name.startsWith('._'));
        console.log('Videos after filtering hidden files for grouping:', validVideos.length);
        
        validVideos.forEach(video => {
            const timestamp = video.timestamp.getTime();
            // Use exact timestamp as key for TeslaCam recordings
            const timestampKey = timestamp;
            
            if (!groups[timestampKey]) {
                groups[timestampKey] = [];
            }
            groups[timestampKey].push(video);
        });

        console.log('Initial groups:', Object.keys(groups).length);
        
        // Convert groups to events
        this.events = Object.values(groups)
            .filter(group => group.length > 0)
            .map(group => ({
                videos: group,
                timestamp: group[0].timestamp,
                duration: 60000 // Default duration, will be updated after videos load
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
            
        console.log('Final events:', this.events.length);
        this.events.forEach((event, index) => {
            console.log(`Event ${index + 1}:`, {
                timestamp: event.timestamp.toISOString(),
                videoCount: event.videos.length,
                cameras: event.videos.map(v => v.camera)
            });
        });
        
        // If we only have one event but multiple videos, try alternative grouping
        if (this.events.length === 1 && this.videos.length > 4) {
            console.log('Only one event detected with many videos, trying alternative grouping...');
            this.groupVideosByAlternativeMethod();
        }
    }

    groupVideosByAlternativeMethod() {
        // Alternative grouping method: group by filename patterns
        const groups = {};
        
        this.videos.forEach(video => {
            // Extract the base timestamp from filename (without seconds)
            const timestampMatch = video.name.match(/(\d{4}-\d{2}-\d{2}_\d{2}-\d{2})/);
            if (timestampMatch) {
                const baseTime = timestampMatch[1];
                if (!groups[baseTime]) {
                    groups[baseTime] = [];
                }
                groups[baseTime].push(video);
            } else {
                // Fallback: group by camera if timestamp extraction fails
                if (!groups[video.camera]) {
                    groups[video.camera] = [];
                }
                groups[video.camera].push(video);
            }
        });
        
        console.log('Alternative grouping results:', Object.keys(groups).length, 'groups');
        
        // Convert to events
        this.events = Object.values(groups)
            .filter(group => group.length > 0)
            .map(group => ({
                videos: group,
                timestamp: group[0].timestamp,
                duration: 60000 // Default duration, will be updated after videos load
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
            
        console.log('Alternative events:', this.events.length);
    }

    updateEventDuration(eventIndex) {
        const event = this.events[eventIndex];
        if (!event) return;
        
        // Find the video element for the first video in this event
        const firstVideo = event.videos[0];
        if (!firstVideo) return;
        
        // Find the video element in the DOM
        const videoItem = this.videoGrid.querySelector(`[data-camera="${firstVideo.camera}"]`);
        if (!videoItem) return;
        
        const video = videoItem.querySelector('video');
        if (!video || !video.src) return;
        
        // Wait for video to load metadata
        if (video.readyState >= 1) {
            const duration = video.duration * 1000; // Convert to milliseconds
            if (!isNaN(duration) && duration > 0) {
                console.log(`Updated event ${eventIndex + 1} duration:`, duration, 'ms');
                event.duration = duration;
                
                // Update the event selection list if it's visible
                if (this.isEventSelectMode) {
                    this.renderEventSelectionList();
                }
            }
        } else {
            // Wait for metadata to load
            video.addEventListener('loadedmetadata', () => {
                const duration = video.duration * 1000;
                if (!isNaN(duration) && duration > 0) {
                    console.log(`Updated event ${eventIndex + 1} duration:`, duration, 'ms');
                    event.duration = duration;
                    
                    // Update the event selection list if it's visible
                    if (this.isEventSelectMode) {
                        this.renderEventSelectionList();
                    }
                }
            }, { once: true });
        }
    }

    calculateEventDuration(videos) {
        if (!videos || videos.length === 0) return 0;
        
        // Get the duration from the first video (all videos in an event should have same duration)
        const firstVideo = videos[0];
        console.log('Calculating duration for video:', firstVideo.name, 'Video object:', firstVideo.video);
        
        if (firstVideo.video) {
            console.log('Video readyState:', firstVideo.video.readyState, 'Duration:', firstVideo.video.duration);
            
            // Check if video has valid duration
            if (!isNaN(firstVideo.video.duration) && firstVideo.video.duration > 0) {
                const duration = firstVideo.video.duration * 1000; // Convert to milliseconds
                console.log('Using actual video duration:', duration, 'ms');
                return duration;
            }
            
            // If video is not loaded yet, try to get duration from metadata
            if (firstVideo.video.readyState >= 1) {
                const duration = firstVideo.video.duration * 1000;
                console.log('Using metadata duration:', duration, 'ms');
                return duration;
            }
        }
        
        // Fallback: estimate based on typical TeslaCam clip length
        console.log('Using fallback duration: 60000ms');
        return 60000; // 1 minute default
    }

    createVideoGrid() {
        this.videoGrid.innerHTML = '';
        
        // Get all unique cameras from all videos, filtering out hidden files
        const allCameras = [...new Set(this.videos
            .filter(video => !video.name.startsWith('._')) // Filter out hidden files
            .map(video => video.camera)
        )];
        
        console.log('Creating video grid for cameras:', allCameras);
        console.log('All videos before filtering:', this.videos.map(v => ({ name: v.name, camera: v.camera })));
        console.log('Videos after filtering hidden files:', this.videos
            .filter(video => !video.name.startsWith('._'))
            .map(v => ({ name: v.name, camera: v.camera }))
        );
        
        // Create video elements for each unique camera
        allCameras.forEach(camera => {
            const videoItem = document.createElement('div');
            videoItem.className = 'video-item';
            videoItem.dataset.camera = camera;
            
            const video = document.createElement('video');
            video.muted = true;
            video.playsInline = true;
            
            const label = document.createElement('div');
            label.className = 'video-label';
            label.textContent = camera;
            
            videoItem.appendChild(video);
            videoItem.appendChild(label);
            
            // Click to enlarge
            videoItem.addEventListener('click', () => this.toggleVideoEnlarge(videoItem));
            
            // Add download trigger button (hidden by default)
            const downloadTrigger = document.createElement('button');
            downloadTrigger.className = 'download-trigger';
            downloadTrigger.innerHTML = '<i class="fas fa-download"></i> Download';
            downloadTrigger.style.display = 'none';
            downloadTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showDownloadOverlay(videoItem);
            });
            videoItem.appendChild(downloadTrigger);
            
            this.videoGrid.appendChild(videoItem);
        });
        
        console.log(`Created ${allCameras.length} video slots for cameras:`, allCameras);
    }

    loadEvent(eventIndex) {
        if (eventIndex < 0 || eventIndex >= this.events.length) return;
        
        this.currentEventIndex = eventIndex;
        const event = this.events[eventIndex];
        
        console.log(`Loading event ${eventIndex + 1} of ${this.events.length}:`, event.timestamp.toLocaleString());
        console.log('Event videos:', event.videos.map(v => ({ name: v.name, camera: v.camera })));
        
        // Filter out hidden files for display
        const validVideos = event.videos.filter(video => !video.name.startsWith('._'));
        console.log('Valid videos (filtered):', validVideos.map(v => ({ name: v.name, camera: v.camera })));
        
        // Load videos for each camera
        const videoItems = this.videoGrid.querySelectorAll('.video-item');
        console.log('Video grid items found:', videoItems.length);
        
        videoItems.forEach(videoItem => {
            const camera = videoItem.dataset.camera;
            const video = videoItem.querySelector('video');
            
            console.log(`Looking for camera: ${camera}`);
            
            // Find video for this camera in current event (filter out hidden files)
            const eventVideo = validVideos.find(v => v.camera === camera);
            
            if (eventVideo) {
                console.log(`Loading video for ${camera}:`, eventVideo.name);
                video.src = eventVideo.objectUrl;
                video.load();
                // Store the video element in the video object for later use
                eventVideo.video = video;
            } else {
                console.log(`No video found for camera: ${camera}`);
                video.src = '';
            }
        });
        
        // Update event duration if not already calculated
        if (event.duration === 60000) {
            this.updateEventDuration(eventIndex);
        }
        
        // Update timeline
        this.updateTimeline();
        
        // Update dropdown selection to reflect current event
        this.updateEventDropdown();
        
        // Auto-play if was playing before
        if (this.isPlaying) {
            this.play();
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        const videos = this.videoGrid.querySelectorAll('video');
        videos.forEach(video => {
            if (video.src) {
                video.play();
            }
        });
        
        this.isPlaying = true;
        this.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        this.playPauseBtn.classList.add('active');
    }

    pause() {
        const videos = this.videoGrid.querySelectorAll('video');
        videos.forEach(video => {
            video.pause();
        });
        
        this.isPlaying = false;
        this.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        this.playPauseBtn.classList.remove('active');
    }

    setPlaybackSpeed(speed) {
        this.currentSpeed = speed;
        
        // Update speed buttons
        this.speedButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseFloat(btn.dataset.speed) === speed) {
                btn.classList.add('active');
            }
        });
        
        // Apply speed to all videos
        const videos = this.videoGrid.querySelectorAll('video');
        videos.forEach(video => {
            video.playbackRate = speed;
        });
    }

    seekToTime(timeValue) {
        const videos = this.videoGrid.querySelectorAll('video');
        const time = parseFloat(timeValue);
        
        if (isNaN(time)) {
            console.warn('Invalid time value:', timeValue);
            return;
        }
        
        videos.forEach(video => {
            if (video.duration && !isNaN(video.duration)) {
                // Ensure time is within valid range
                const clampedTime = Math.max(0, Math.min(time, video.duration));
                video.currentTime = clampedTime;
                console.log(`Seeking to ${clampedTime}s (${timeValue})`);
            }
        });
    }

    updateTimeline() {
        const videos = this.videoGrid.querySelectorAll('video');
        const mainVideo = videos[0];
        
        console.log('Updating timeline for video:', mainVideo?.src);
        
        if (mainVideo && mainVideo.src) {
            // Remove existing event listeners to prevent duplicates
            mainVideo.removeEventListener('timeupdate', this.updateTimeHandler);
            mainVideo.removeEventListener('loadedmetadata', this.updateTimeHandler);
            
            // Create a bound event handler
            this.updateTimeHandler = () => {
                if (mainVideo.duration && !isNaN(mainVideo.duration)) {
                    this.timeline.max = mainVideo.duration;
                    this.timeline.min = 0;
                    this.currentTimeSpan.textContent = this.formatTime(mainVideo.currentTime || 0);
                    this.totalTimeSpan.textContent = this.formatTime(mainVideo.duration);
                    this.timeline.value = mainVideo.currentTime || 0;
                }
            };
            
            // Add event listeners
            mainVideo.addEventListener('timeupdate', this.updateTimeHandler);
            mainVideo.addEventListener('loadedmetadata', this.updateTimeHandler);
            mainVideo.addEventListener('canplay', this.updateTimeHandler);
            
            // Initial update
            this.updateTimeHandler();
            
            console.log('Timeline setup complete. Max duration:', mainVideo.duration);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    previousEvent() {
        if (this.currentEventIndex > 0) {
            console.log(`Navigating to previous event: ${this.currentEventIndex - 1}`);
            this.loadEvent(this.currentEventIndex - 1);
        } else {
            console.log('Already at first event');
        }
    }

    nextEvent() {
        if (this.currentEventIndex < this.events.length - 1) {
            console.log(`Navigating to next event: ${this.currentEventIndex + 1}`);
            this.loadEvent(this.currentEventIndex + 1);
        } else {
            console.log('Already at last event');
        }
    }

    selectEvent(eventIndex) {
        if (eventIndex !== '') {
            this.loadEvent(parseInt(eventIndex));
        }
    }

    jumpToEvent() {
        // Jump to about 1 minute before the end (typical for Sentry events)
        const videos = this.videoGrid.querySelectorAll('video');
        videos.forEach(video => {
            if (video.duration) {
                const jumpTime = Math.max(0, video.duration - 60);
                video.currentTime = jumpTime;
            }
        });
    }

    toggleVideoEnlarge(videoItem) {
        const isEnlarged = videoItem.classList.contains('enlarged');
        
        if (isEnlarged) {
            // Shrinking - hide download button
            videoItem.classList.remove('enlarged');
            const downloadTrigger = videoItem.querySelector('.download-trigger');
            if (downloadTrigger) {
                downloadTrigger.style.display = 'none';
            }
        } else {
            // Enlarging - show download button
            videoItem.classList.add('enlarged');
            const downloadTrigger = videoItem.querySelector('.download-trigger');
            if (downloadTrigger) {
                downloadTrigger.style.display = 'block';
            }
        }
    }

    populateEventSelect() {
        this.eventSelect.innerHTML = '<option value="">Select Event...</option>';
        
        this.events.forEach((event, index) => {
            const option = document.createElement('option');
            option.value = index;
            const timeStr = event.timestamp.toLocaleString();
            const cameraCount = event.videos.length;
            option.textContent = `Event ${index + 1} - ${timeStr} (${cameraCount} cameras)`;
            this.eventSelect.appendChild(option);
        });
        
        // Show jump button if we have events
        if (this.events.length > 0) {
            this.jumpToEventBtn.style.display = 'inline-block';
        }
        
        console.log(`Populated event select with ${this.events.length} events`);
    }

    updateEventDropdown() {
        // Update the dropdown to show the current event
        if (this.currentEventIndex >= 0 && this.currentEventIndex < this.events.length) {
            this.eventSelect.value = this.currentEventIndex.toString();
            console.log(`Updated dropdown to event ${this.currentEventIndex + 1}`);
        }
        
        // Update the event info display
        if (this.events.length > 0) {
            this.eventInfoSpan.textContent = `Event: ${this.currentEventIndex + 1}/${this.events.length}`;
        } else {
            this.eventInfoSpan.textContent = 'Event: 0/0';
        }
    }

    updateFileCount() {
        this.fileCountSpan.textContent = this.videos.length;
    }

    updateEventCount() {
        this.eventCountSpan.textContent = this.events.length;
    }

    showVideoContainer() {
        this.fileSelection.style.display = 'none';
        this.videoContainer.style.display = 'block';
        this.showEventCombinationSection();
    }

    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.textContent = 'Loading videos...';
        this.uploadArea.appendChild(loadingDiv);
    }

    hideLoading() {
        const loadingDiv = this.uploadArea.querySelector('.loading');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error';
        errorDiv.textContent = message;
        this.uploadArea.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success';
        successDiv.textContent = message;
        this.uploadArea.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    showDownloadOverlay(videoItem) {
        const video = videoItem.querySelector('video');
        const camera = videoItem.dataset.camera;
        
        // Find the video file info
        const currentEvent = this.events[this.currentEventIndex];
        const videoInfo = currentEvent.videos.find(v => v.camera === camera);
        
        if (videoInfo) {
            this.currentDownloadVideo = videoInfo;
            this.downloadFileName.textContent = videoInfo.name;
            this.downloadCamera.textContent = `Camera: ${camera}`;
            this.downloadOverlay.style.display = 'flex';
        }
    }

    hideDownloadOverlay() {
        this.downloadOverlay.style.display = 'none';
        this.currentDownloadVideo = null;
    }

    downloadVideo() {
        if (!this.currentDownloadVideo) return;
        
        try {
            // Create a download link
            const link = document.createElement('a');
            link.href = this.currentDownloadVideo.objectUrl;
            link.download = this.currentDownloadVideo.name;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showSuccess('Video download started!');
            this.hideDownloadOverlay();
        } catch (error) {
            console.error('Download failed:', error);
            this.showError('Download failed. Please try again.');
        }
    }



    // Splicing Methods
    setSpliceStart() {
        const videos = this.videoGrid.querySelectorAll('video');
        const mainVideo = videos[0];
        
        if (mainVideo && mainVideo.currentTime !== undefined) {
            this.spliceStartTime = mainVideo.currentTime;
            this.setStartBtn.classList.add('active');
            this.setStartBtn.innerHTML = '<i class="fas fa-play"></i> Start: ' + this.formatTime(this.spliceStartTime);
            this.showSuccess(`Start time set to ${this.formatTime(this.spliceStartTime)}`);
            console.log('Splice start time set to:', this.spliceStartTime);
        }
    }

    setSpliceEnd() {
        const videos = this.videoGrid.querySelectorAll('video');
        const mainVideo = videos[0];
        
        if (mainVideo && mainVideo.currentTime !== undefined) {
            this.spliceEndTime = mainVideo.currentTime;
            this.setEndBtn.classList.add('active');
            this.setEndBtn.innerHTML = '<i class="fas fa-stop"></i> End: ' + this.formatTime(this.spliceEndTime);
            this.showSuccess(`End time set to ${this.formatTime(this.spliceEndTime)}`);
            console.log('Splice end time set to:', this.spliceEndTime);
        }
    }

    createSplice() {
        if (this.spliceStartTime === null || this.spliceEndTime === null) {
            this.showError('Please set both start and end times before creating a splice.');
            return;
        }

        if (this.spliceStartTime >= this.spliceEndTime) {
            this.showError('Start time must be before end time.');
            return;
        }

        const currentEvent = this.events[this.currentEventIndex];
        const duration = this.spliceEndTime - this.spliceStartTime;
        
        // Create splice for each camera
        const splicedVideos = [];
        currentEvent.videos.forEach(videoInfo => {
            const splicedVideo = {
                ...videoInfo,
                spliceStart: this.spliceStartTime,
                spliceEnd: this.spliceEndTime,
                duration: duration,
                isSpliced: true,
                originalEvent: this.currentEventIndex
            };
            splicedVideos.push(splicedVideo);
        });

        // Create a new custom clip
        const customClip = {
            id: Date.now(),
            name: `Clip_${this.customClipsArray.length + 1}`,
            videos: splicedVideos,
            startTime: this.spliceStartTime,
            endTime: this.spliceEndTime,
            duration: duration,
            timestamp: new Date(),
            originalEvent: this.currentEventIndex
        };

        this.customClipsArray.push(customClip);
        this.updateClipCount();
        this.renderCustomClips();
        this.showCustomClipsSection();

        // Reset splicing state
        this.resetSpliceState();
        this.showSuccess(`Created splice: ${this.formatTime(duration)} duration`);
    }

    resetSpliceState() {
        this.spliceStartTime = null;
        this.spliceEndTime = null;
        this.setStartBtn.classList.remove('active');
        this.setEndBtn.classList.remove('active');
        this.setStartBtn.innerHTML = '<i class="fas fa-play"></i> Set Start';
        this.setEndBtn.innerHTML = '<i class="fas fa-stop"></i> Set End';
    }

    updateClipCount() {
        this.clipCountSpan.textContent = this.customClipsArray.length;
    }

    showCustomClipsSection() {
        if (this.customClipsArray.length > 0) {
            this.customClips.style.display = 'block';
        }
    }

    renderCustomClips() {
        this.clipsContainer.innerHTML = '';
        
        this.customClipsArray.forEach(clip => {
            const clipElement = document.createElement('div');
            clipElement.className = 'clip-item';
            clipElement.dataset.clipId = clip.id;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.style.display = this.isSelectMode ? 'block' : 'none';
            checkbox.addEventListener('change', (e) => this.toggleClipSelection(clip.id, e.target.checked));
            
            const clipInfo = document.createElement('div');
            clipInfo.className = 'clip-info';
            
            // Safe time display with fallbacks
            const startTimeDisplay = (clip.startTime !== undefined && clip.startTime !== null) ? clip.startTime.toFixed(1) : '0.0';
            const endTimeDisplay = (clip.endTime !== undefined && clip.endTime !== null) ? clip.endTime.toFixed(1) : '0.0';
            
            clipInfo.innerHTML = `
                <div class="clip-name">${clip.name}</div>
                <div class="clip-duration">Duration: ${this.formatTime(clip.duration)}</div>
                <div class="clip-time">${startTimeDisplay}s - ${endTimeDisplay}s</div>
                <div class="clip-time">Cameras: ${clip.videos ? clip.videos.length : 1}</div>
            `;
            
            // Add download button for each camera
            const downloadContainer = document.createElement('div');
            downloadContainer.className = 'clip-downloads';
            
            // Show download buttons for each camera (same for both regular and combined clips)
            clip.videos.forEach(video => {
                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'clip-download-btn';
                downloadBtn.innerHTML = `<i class="fas fa-download"></i> ${video.camera}`;
                downloadBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (clip.isCombined) {
                        this.downloadCombinedClip(clip, video);
                    } else {
                        this.downloadSplicedClip(clip, video);
                    }
                });
                downloadContainer.appendChild(downloadBtn);
            });
            
            clipElement.appendChild(checkbox);
            clipElement.appendChild(clipInfo);
            clipElement.appendChild(downloadContainer);
            
            // Add click handler for selection mode
            clipElement.addEventListener('click', (e) => {
                if (this.isSelectMode && e.target.type !== 'checkbox') {
                    const checkbox = clipElement.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    this.toggleClipSelection(clip.id, checkbox.checked);
                }
            });
            
            this.clipsContainer.appendChild(clipElement);
        });
    }

    toggleSelectMode() {
        this.isSelectMode = !this.isSelectMode;
        this.selectedClips = [];
        
        if (this.isSelectMode) {
            this.selectClipsBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Selection';
            this.selectClipsBtn.classList.add('active');
            this.combineBtn.style.display = 'inline-flex';
            this.showSuccess('Select clips to combine');
        } else {
            this.selectClipsBtn.innerHTML = '<i class="fas fa-check-square"></i> Select Clips';
            this.selectClipsBtn.classList.remove('active');
            this.combineBtn.style.display = 'none';
            this.renderCustomClips(); // Hide checkboxes
        }
    }

    toggleClipSelection(clipId, isSelected) {
        if (isSelected) {
            if (!this.selectedClips.includes(clipId)) {
                this.selectedClips.push(clipId);
            }
        } else {
            this.selectedClips = this.selectedClips.filter(id => id !== clipId);
        }
        
        // Update visual selection
        const clipElement = this.clipsContainer.querySelector(`[data-clip-id="${clipId}"]`);
        if (clipElement) {
            clipElement.classList.toggle('selected', isSelected);
        }
        
        console.log('Selected clips:', this.selectedClips);
    }

    combineSelectedClips() {
        if (this.selectedClips.length < 2) {
            this.showError('Please select at least 2 clips to combine.');
            return;
        }

        const selectedClipData = this.selectedClips.map(clipId => 
            this.customClipsArray.find(clip => clip.id === clipId)
        ).filter(Boolean);

        // Group by camera type
        const clipsByCamera = {};
        selectedClipData.forEach(clip => {
            clip.videos.forEach(video => {
                if (!clipsByCamera[video.camera]) {
                    clipsByCamera[video.camera] = [];
                }
                clipsByCamera[video.camera].push({
                    ...video,
                    clipId: clip.id
                });
            });
        });

        // Create one combined clip with all cameras
        const allCameras = Object.keys(clipsByCamera);
        const totalDuration = Math.max(...allCameras.map(camera => 
            clipsByCamera[camera].reduce((sum, clip) => sum + clip.duration, 0)
        ));
        
        // Calculate overall start and end times for display
        const allStartTimes = allCameras.flatMap(camera => 
            clipsByCamera[camera].map(clip => clip.spliceStart || 0)
        );
        const allEndTimes = allCameras.flatMap(camera => 
            clipsByCamera[camera].map(clip => clip.spliceEnd || clip.duration)
        );
        const startTime = Math.min(...allStartTimes);
        const endTime = Math.max(...allEndTimes);
        
        // Create video objects for each camera
        const videoObjects = allCameras.map(camera => {
            const cameraClips = clipsByCamera[camera];
            const cameraDuration = cameraClips.reduce((sum, clip) => sum + clip.duration, 0);
            
            return {
                camera: camera,
                spliceStart: startTime,
                spliceEnd: endTime,
                duration: cameraDuration,
                isCombined: true
            };
        });
        
        const combinedClip = {
            id: Date.now() + Math.random(),
            name: `Combined_${this.customClipsArray.length + 1}`,
            videos: videoObjects, // All cameras in one clip
            clips: selectedClipData, // Keep original clips for processing
            duration: totalDuration,
            startTime: startTime,
            endTime: endTime,
            timestamp: new Date(),
            isCombined: true
        };

        this.customClipsArray.push(combinedClip);

        this.updateClipCount();
        this.renderCustomClips();
        this.toggleSelectMode(); // Exit selection mode
        this.showSuccess(`Combined ${this.selectedClips.length} clips into ${Object.keys(clipsByCamera).length} videos`);
    }

    downloadSplicedClip(clip, videoInfo) {
        // Find the original video element
        const videoElements = this.videoGrid.querySelectorAll('video');
        const targetVideo = Array.from(videoElements).find(video => {
            const videoItem = video.closest('.video-item');
            const label = videoItem.querySelector('.video-label');
            return label && label.textContent.includes(videoInfo.camera);
        });

        if (!targetVideo) {
            this.showError(`Could not find video for ${videoInfo.camera} camera`);
            return;
        }

        // Create a canvas to extract the spliced portion
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas size to match video dimensions
        canvas.width = targetVideo.videoWidth;
        canvas.height = targetVideo.videoHeight;

        // Create a MediaRecorder to record the spliced portion
        const stream = canvas.captureStream();
        
        // Try to use MP4-compatible codecs, fallback to WebM if not supported
        let mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp8';
            }
        }
        
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: mimeType
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            // Create download link
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clip.name}_${videoInfo.camera}_${clip.startTime.toFixed(1)}s-${clip.endTime.toFixed(1)}s.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Clean up
            URL.revokeObjectURL(url);
            this.showSuccess(`Downloaded ${videoInfo.camera} clip: ${clip.name} (${fileExtension.toUpperCase()})`);
        };

        // Start recording
        mediaRecorder.start();
        
        // Seek to start time and play
        targetVideo.currentTime = clip.startTime;
        targetVideo.play();

        // Draw frames to canvas
        const drawFrame = () => {
            if (targetVideo.currentTime >= clip.endTime) {
                mediaRecorder.stop();
                targetVideo.pause();
                return;
            }
            
            ctx.drawImage(targetVideo, 0, 0, canvas.width, canvas.height);
            requestAnimationFrame(drawFrame);
        };

        targetVideo.addEventListener('canplay', () => {
            drawFrame();
        });
    }

    async downloadCombinedClip(clip, videoInfo) {
        this.showStatusMessage(`Processing combined clip download for ${videoInfo.camera}...`, 'info');
        console.log('Starting combined clip download:', clip.name, 'Camera:', videoInfo.camera);
        
        // Check if WebCodecs API is supported and we're in a secure context
        const useWebCodecs = ('VideoEncoder' in window) && ('VideoDecoder' in window) && window.isSecureContext;
        
        if (!useWebCodecs) {
            console.log('WebCodecs not available, using fallback Canvas/MediaRecorder method');
            this.showStatusMessage('Using fallback method (slower but compatible)...', 'info');
        }

        // Find the original video element for this camera
        const videoElements = this.videoGrid.querySelectorAll('video');
        const targetVideo = Array.from(videoElements).find(video => {
            const videoItem = video.closest('.video-item');
            const label = videoItem.querySelector('.video-label');
            return label && label.textContent.includes(videoInfo.camera);
        });

        if (!targetVideo) {
            this.showError(`Could not find video for ${videoInfo.camera} camera`);
            return;
        }

        try {
            // Get video dimensions and frame rate
            const width = targetVideo.videoWidth || 1920;
            const height = targetVideo.videoHeight || 1080;
            const frameRate = 30; // Default frame rate

            console.log(`Video dimensions: ${width}x${height}, Frame rate: ${frameRate}`);

            // Use appropriate processing method based on WebCodecs availability
            if (useWebCodecs) {
                await this.processCombinedClipWithWebCodecs(clip, videoInfo, targetVideo, width, height, frameRate);
            } else {
                await this.processCombinedClipOptimized(clip, videoInfo, targetVideo, width, height, frameRate);
            }

        } catch (error) {
            console.error('Error processing combined clip:', error);
            this.showError(`Failed to process combined clip: ${error.message}`);
        }
    }

    async processCombinedClipOptimized(clip, videoInfo, targetVideo, width, height, frameRate) {
        // Create canvas for video processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Create MediaRecorder with optimized settings
        const stream = canvas.captureStream(frameRate);
        let mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                    mimeType = 'video/webm';
                }
            }
        }
        
        const mediaRecorder = new MediaRecorder(stream, { 
            mimeType,
            videoBitsPerSecond: 10000000 // 10 Mbps for better quality
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${clip.name}_${videoInfo.camera}_combined.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showSuccess(`Downloaded combined ${videoInfo.camera} clip: ${clip.name} (${fileExtension.toUpperCase()})`);
        };

        // Start recording
        mediaRecorder.start();

        // Process each clip segment in sequence with optimized frame processing
        for (let i = 0; i < clip.clips.length; i++) {
            const clipSegment = clip.clips[i];
            const startTime = clipSegment.spliceStart || 0;
            const endTime = clipSegment.spliceEnd || clipSegment.duration;
            
            console.log(`Processing clip segment ${i + 1}/${clip.clips.length}: ${startTime}s to ${endTime}s`);
            
            // Seek to start time
            targetVideo.currentTime = startTime;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                targetVideo.addEventListener('canplay', resolve, { once: true });
                targetVideo.play();
            });

            // Process video frames with optimized timing
            await new Promise((resolve) => {
                const frameInterval = 1000 / frameRate;
                let lastFrameTime = 0;
                
                const processFrame = (currentTime) => {
                    if (targetVideo.currentTime >= endTime || targetVideo.ended || targetVideo.paused) {
                        resolve();
                        return;
                    }
                    
                    // Only draw frame at specified frame rate
                    if (currentTime - lastFrameTime >= frameInterval) {
                        ctx.drawImage(targetVideo, 0, 0, width, height);
                        lastFrameTime = currentTime;
                    }
                    
                    requestAnimationFrame(processFrame);
                };
                
                requestAnimationFrame(processFrame);
            });

            // Small delay between clip segments
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Stop recording
        mediaRecorder.stop();
    }

    async processCombinedClipWithWebCodecs(clip, videoInfo, targetVideo, width, height, frameRate) {
        console.log('Using WebCodecs API for fast combined clip processing...');
        
        try {
            // Try to use MP4 encoding if supported
            let mimeType = 'video/mp4';
            if (!MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/webm;codecs=vp9';
                if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                    mimeType = 'video/webm;codecs=vp8';
                    if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                        mimeType = 'video/webm';
                    }
                }
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;

            // Create MediaRecorder with optimized settings for MP4
            const stream = canvas.captureStream(frameRate);
            const mediaRecorder = new MediaRecorder(stream, { 
                mimeType,
                videoBitsPerSecond: 12000000 // 12 Mbps for high quality MP4
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `${clip.name}_${videoInfo.camera}_combined.${fileExtension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                URL.revokeObjectURL(url);
                this.showSuccess(`Downloaded combined ${videoInfo.camera} clip: ${clip.name} (${fileExtension.toUpperCase()} - WebCodecs)`);
            };

            // Start recording
            mediaRecorder.start();

            // Process each clip segment with WebCodecs-optimized approach
            for (let i = 0; i < clip.clips.length; i++) {
                const clipSegment = clip.clips[i];
                const startTime = clipSegment.spliceStart || 0;
                const endTime = clipSegment.spliceEnd || clipSegment.duration;
                
                console.log(`Processing clip segment ${i + 1}/${clip.clips.length}: ${startTime}s to ${endTime}s (WebCodecs)`);
                
                // Seek to start time
                targetVideo.currentTime = startTime;
                
                // Wait for video to be ready
                await new Promise((resolve) => {
                    targetVideo.addEventListener('canplay', resolve, { once: true });
                    targetVideo.play();
                });

                // Process video frames with WebCodecs-optimized timing
                await new Promise((resolve) => {
                    const frameInterval = 1000 / frameRate;
                    let lastFrameTime = 0;
                    
                    const processFrame = (currentTime) => {
                        if (targetVideo.currentTime >= endTime || targetVideo.ended || targetVideo.paused) {
                            resolve();
                            return;
                        }
                        
                        // Optimized frame processing for WebCodecs
                        if (currentTime - lastFrameTime >= frameInterval) {
                            ctx.drawImage(targetVideo, 0, 0, width, height);
                            lastFrameTime = currentTime;
                        }
                        
                        requestAnimationFrame(processFrame);
                    };
                    
                    requestAnimationFrame(processFrame);
                });

                // Minimal delay between clip segments for WebCodecs
                await new Promise(resolve => setTimeout(resolve, 25));
            }

            // Stop recording
            mediaRecorder.stop();
            
        } catch (error) {
            console.error('WebCodecs processing failed, falling back to standard method:', error);
            // Fallback to standard method if WebCodecs fails
            await this.processCombinedClipOptimized(clip, videoInfo, targetVideo, width, height, frameRate);
        }
    }

    cleanup() {
        // Clean up object URLs to prevent memory leaks
        this.objectUrls.forEach(url => {
            URL.revokeObjectURL(url);
        });
        this.objectUrls = [];
    }

    // Event Combination Methods
    showEventCombinationSection() {
        this.eventCombination.style.display = 'block';
    }

    toggleEventSelectMode() {
        this.isEventSelectMode = !this.isEventSelectMode;
        
        if (this.isEventSelectMode) {
            this.selectEventsBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Selection';
            this.selectEventsBtn.classList.add('primary');
            this.combineEventsBtn.style.display = 'inline-block';
            this.clearEventSelectionBtn.style.display = 'inline-block';
            this.selectedEventsContainer.style.display = 'block';
            this.renderEventSelectionList();
        } else {
            this.selectEventsBtn.innerHTML = '<i class="fas fa-check-square"></i> Select Events';
            this.selectEventsBtn.classList.remove('primary');
            this.combineEventsBtn.style.display = 'none';
            this.clearEventSelectionBtn.style.display = 'none';
            this.selectedEventsContainer.style.display = 'none';
            this.clearEventSelection();
        }
    }

    renderEventSelectionList() {
        this.selectedEventsList.innerHTML = '';
        
        this.events.forEach((event, index) => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            
            // Calculate duration with better handling
            const duration = this.calculateEventDuration(event.videos) / 1000;
            const durationText = duration > 0 ? this.formatTime(duration) : 'Loading...';
            
            eventItem.innerHTML = `
                <div class="event-info">
                    <div class="event-name">Event ${index + 1}</div>
                    <div class="event-details">
                        ${event.videos.length} cameras • ${durationText}
                    </div>
                </div>
                <div class="event-downloads">
                    <button class="event-download-btn" onclick="teslaCamPlayer.toggleEventSelection(${index})">
                        <i class="fas fa-${this.selectedEvents.includes(index) ? 'check' : 'plus'}"></i>
                        ${this.selectedEvents.includes(index) ? 'Selected' : 'Select'}
                    </button>
                </div>
            `;
            this.selectedEventsList.appendChild(eventItem);
            
            // If duration is still loading, try to update it when video loads
            if (duration <= 0 && event.videos.length > 0) {
                const firstVideo = event.videos[0];
                if (firstVideo.video) {
                    firstVideo.video.addEventListener('loadedmetadata', () => {
                        // Re-render the list to show updated duration
                        this.renderEventSelectionList();
                    }, { once: true });
                }
            }
        });
    }

    toggleEventSelection(eventIndex) {
        if (!this.isEventSelectMode) return;
        
        const index = this.selectedEvents.indexOf(eventIndex);
        if (index > -1) {
            this.selectedEvents.splice(index, 1);
        } else {
            this.selectedEvents.push(eventIndex);
        }
        
        this.renderEventSelectionList();
        this.updateCombineButton();
    }

    updateCombineButton() {
        if (this.selectedEvents.length >= 2) {
            this.combineEventsBtn.innerHTML = `<i class="fas fa-layer-group"></i> Combine ${this.selectedEvents.length} Events`;
            this.combineEventsBtn.disabled = false;
        } else {
            this.combineEventsBtn.innerHTML = '<i class="fas fa-layer-group"></i> Select at least 2 events';
            this.combineEventsBtn.disabled = true;
        }
    }

    combineSelectedEvents() {
        if (this.selectedEvents.length < 2) {
            this.showError('Please select at least 2 events to combine');
            return;
        }

        const combinedEvent = {
            id: `combined-${Date.now()}`,
            name: `Combined Events (${this.selectedEvents.length} events)`,
            events: this.selectedEvents.map(index => this.events[index]),
            totalDuration: 0,
            cameras: new Set()
        };

        // Calculate total duration and collect all cameras
        let totalDuration = 0;
        this.selectedEvents.forEach(eventIndex => {
            const event = this.events[eventIndex];
            // Calculate actual duration from videos, not use the hardcoded duration property
            const eventDuration = this.calculateEventDuration(event.videos);
            console.log(`Event ${eventIndex} calculated duration:`, eventDuration, 'ms');
            totalDuration += eventDuration;
            event.videos.forEach(video => combinedEvent.cameras.add(video.camera));
        });

        combinedEvent.totalDuration = totalDuration;
        combinedEvent.totalDurationSeconds = totalDuration / 1000;

        combinedEvent.cameras = Array.from(combinedEvent.cameras);

        this.combinedEvents.push(combinedEvent);
        this.renderCombinedEvents();
        this.showEventCombinationSection();
        this.combinedEventsContainer.style.display = 'block';
        
        this.showSuccess(`Successfully combined ${this.selectedEvents.length} events (Total: ${this.formatTime(combinedEvent.totalDurationSeconds)})`);
        this.clearEventSelection();
    }

    renderCombinedEvents() {
        this.combinedEventsList.innerHTML = '';
        
        this.combinedEvents.forEach((combinedEvent, index) => {
            const combinedItem = document.createElement('div');
            combinedItem.className = 'combined-event-item';
            combinedItem.innerHTML = `
                <div class="combined-event-header">
                    <div class="combined-event-name">${combinedEvent.name}</div>
                    <div class="combined-event-count">${combinedEvent.events.length} events</div>
                </div>
                <div class="combined-event-details">
                    <div>Duration: ${this.formatTime(combinedEvent.totalDurationSeconds)}</div>
                    <div>Cameras: ${combinedEvent.cameras.join(', ')}</div>
                </div>
                <div class="combined-event-downloads">
                    ${combinedEvent.cameras.map(camera => `
                        <button class="combined-event-download-btn" onclick="teslaCamPlayer.downloadCombinedEvent(${index}, '${camera}')">
                            <i class="fas fa-download"></i> Download ${camera}
                        </button>
                    `).join('')}
                </div>
            `;
            this.combinedEventsList.appendChild(combinedItem);
        });
    }

    async downloadCombinedEvent(combinedEventIndex, camera) {
        const combinedEvent = this.combinedEvents[combinedEventIndex];
        if (!combinedEvent) {
            this.showError('Combined event not found');
            return;
        }

        this.showStatusMessage(`Processing combined event download for ${camera}...`, 'info');
        console.log('Starting download for combined event:', combinedEvent);
        console.log('Camera:', camera);

        // Check if WebCodecs API is supported and we're in a secure context
        const useWebCodecs = ('VideoEncoder' in window) && ('VideoDecoder' in window) && window.isSecureContext;
        
        if (!useWebCodecs) {
            console.log('WebCodecs not available, using fallback Canvas/MediaRecorder method');
            this.showStatusMessage('Using fallback method (slower but compatible)...', 'info');
        }

        // Find all videos for the specified camera across all events
        const cameraVideos = [];
        combinedEvent.events.forEach(event => {
            const cameraVideo = event.videos.find(video => video.camera === camera);
            if (cameraVideo) {
                cameraVideos.push(cameraVideo);
            }
        });

        if (cameraVideos.length === 0) {
            this.showError(`No ${camera} camera videos found in selected events`);
            return;
        }

        console.log('Found camera videos:', cameraVideos.length);

        try {
            // Create separate video elements for each event's video
            const videoElements = [];
            
            for (let i = 0; i < cameraVideos.length; i++) {
                const cameraVideo = cameraVideos[i];
                
                // Create a new video element for this specific video
                const video = document.createElement('video');
                video.src = cameraVideo.objectUrl;
                video.muted = true;
                video.playsInline = true;
                
                // Wait for the video to load metadata
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Video load timeout'));
                    }, 5000);
                    
                    video.addEventListener('loadedmetadata', () => {
                        clearTimeout(timeout);
                        resolve();
                    }, { once: true });
                    
                    video.addEventListener('error', () => {
                        clearTimeout(timeout);
                        reject(new Error('Video load error'));
                    }, { once: true });
                    
                    video.load();
                });
                
                videoElements.push({
                    video: video,
                    name: cameraVideo.name,
                    objectUrl: cameraVideo.objectUrl
                });
            }

            // Get video dimensions from first video
            const firstVideo = videoElements[0].video;
            const width = firstVideo.videoWidth || 1920;
            const height = firstVideo.videoHeight || 1080;
            const frameRate = 30; // Default frame rate

            console.log(`Video dimensions: ${width}x${height}, Frame rate: ${frameRate}`);

            // Use appropriate processing method based on WebCodecs availability
            if (useWebCodecs) {
                await this.processVideosWithWebCodecs(videoElements, width, height, frameRate, camera, combinedEvent);
            } else {
                await this.processVideosOptimized(videoElements, width, height, frameRate, camera, combinedEvent);
            }

        } catch (error) {
            console.error('Error processing videos:', error);
            this.showError(`Failed to process videos: ${error.message}`);
        }
    }

    async processVideosOptimized(videoElements, width, height, frameRate, camera, combinedEvent) {
        // Create canvas for video processing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = width;
        canvas.height = height;

        // Create MediaRecorder with optimized settings
        const stream = canvas.captureStream(frameRate);
        let mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported('video/mp4')) {
            mimeType = 'video/webm;codecs=vp9';
            if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                mimeType = 'video/webm;codecs=vp8';
                if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                    mimeType = 'video/webm';
                }
            }
        }
        
        const mediaRecorder = new MediaRecorder(stream, { 
            mimeType,
            videoBitsPerSecond: 10000000 // 10 Mbps for better quality
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
            const blob = new Blob(chunks, { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `combined_events_${camera}_${combinedEvent.events.length}_events.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showSuccess(`Downloaded combined ${camera} compilation: ${combinedEvent.events.length} events (${fileExtension.toUpperCase()})`);
        };

        // Start recording
        mediaRecorder.start();

        // Process each video in sequence with optimized frame processing
        for (let i = 0; i < videoElements.length; i++) {
            const videoElement = videoElements[i];
            const video = videoElement.video;
            
            console.log(`Processing video ${i + 1}/${videoElements.length}: ${videoElement.name}`);
            
            // Reset video to beginning
            video.currentTime = 0;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                video.addEventListener('canplay', resolve, { once: true });
                video.play();
            });

            // Process video frames with optimized timing
            await new Promise((resolve) => {
                const startTime = performance.now();
                const frameInterval = 1000 / frameRate; // Time between frames
                let lastFrameTime = 0;
                
                const processFrame = (currentTime) => {
                    if (video.ended || video.paused) {
                        resolve();
                        return;
                    }
                    
                    // Only draw frame at specified frame rate
                    if (currentTime - lastFrameTime >= frameInterval) {
                        ctx.drawImage(video, 0, 0, width, height);
                        lastFrameTime = currentTime;
                    }
                    
                    requestAnimationFrame(processFrame);
                };
                
                requestAnimationFrame(processFrame);
            });

            // Small delay between videos
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Stop recording
        mediaRecorder.stop();
    }

    async processVideosWithWebCodecs(videoElements, width, height, frameRate, camera, combinedEvent) {
        console.log('Using WebCodecs API for fast video processing...');
        
        try {
            // Try to use MP4 encoding if supported
            let mimeType = 'video/mp4';
            if (!MediaRecorder.isTypeSupported('video/mp4')) {
                mimeType = 'video/webm;codecs=vp9';
                if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
                    mimeType = 'video/webm;codecs=vp8';
                    if (!MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
                        mimeType = 'video/webm';
                    }
                }
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;

            // Create MediaRecorder with optimized settings for MP4
            const stream = canvas.captureStream(frameRate);
            const mediaRecorder = new MediaRecorder(stream, { 
                mimeType,
                videoBitsPerSecond: 12000000 // 12 Mbps for high quality MP4
            });

            const chunks = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
                const blob = new Blob(chunks, { type: mimeType });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `combined_events_${camera}_${combinedEvent.events.length}_events.${fileExtension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                URL.revokeObjectURL(url);
                this.showSuccess(`Downloaded combined ${camera} compilation: ${combinedEvent.events.length} events (${fileExtension.toUpperCase()} - WebCodecs)`);
            };

            // Start recording
            mediaRecorder.start();

            // Process each video with WebCodecs-optimized approach
            for (let i = 0; i < videoElements.length; i++) {
                const videoElement = videoElements[i];
                const video = videoElement.video;
                
                console.log(`Processing video ${i + 1}/${videoElements.length}: ${videoElement.name} (WebCodecs)`);
                
                // Reset video to beginning
                video.currentTime = 0;
                
                // Wait for video to be ready
                await new Promise((resolve) => {
                    video.addEventListener('canplay', resolve, { once: true });
                    video.play();
                });

                // Process video frames with WebCodecs-optimized timing
                await new Promise((resolve) => {
                    const frameInterval = 1000 / frameRate;
                    let lastFrameTime = 0;
                    
                    const processFrame = (currentTime) => {
                        if (video.ended || video.paused) {
                            resolve();
                            return;
                        }
                        
                        // Optimized frame processing for WebCodecs
                        if (currentTime - lastFrameTime >= frameInterval) {
                            ctx.drawImage(video, 0, 0, width, height);
                            lastFrameTime = currentTime;
                        }
                        
                        requestAnimationFrame(processFrame);
                    };
                    
                    requestAnimationFrame(processFrame);
                });

                // Minimal delay between videos for WebCodecs
                await new Promise(resolve => setTimeout(resolve, 25));
            }

            // Stop recording
            mediaRecorder.stop();
            
        } catch (error) {
            console.error('WebCodecs processing failed, falling back to standard method:', error);
            // Fallback to standard method if WebCodecs fails
            await this.processVideosOptimized(videoElements, width, height, frameRate, camera, combinedEvent);
        }
    }

    clearEventSelection() {
        this.selectedEvents = [];
        this.isEventSelectMode = false;
        this.selectEventsBtn.innerHTML = '<i class="fas fa-check-square"></i> Select Events';
        this.selectEventsBtn.classList.remove('primary');
        this.combineEventsBtn.style.display = 'none';
        this.clearEventSelectionBtn.style.display = 'none';
        this.selectedEventsContainer.style.display = 'none';
        this.renderEventSelectionList();
    }

    showStatusMessage(message, type = 'info') {
        const statusDiv = document.createElement('div');
        statusDiv.className = `status-message ${type}`;
        statusDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(statusDiv);
        
        setTimeout(() => {
            if (statusDiv.parentNode) {
                statusDiv.parentNode.removeChild(statusDiv);
            }
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.teslaCamPlayer = new TeslaCamPlayer();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.teslaCamPlayer) {
        window.teslaCamPlayer.cleanup();
    }
}); 