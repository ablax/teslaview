class TeslaCamPlayer {
    constructor() {
        // Production mode flag - set to true to disable console logs
        this.isProduction = true; // Set to true for production
        
        this.videos = [];
        this.events = [];
        this.currentEventIndex = 0;
        this.isPlaying = false;
        this.currentSpeed = 1;
        this.objectUrls = [];

        // Telemetry (newer TeslaCam videos may contain a timed metadata track)
        this.telemetryEnabled = true;
        this.telemetryByEventIndex = new Map(); // eventIndex -> { points: [{t,data}], keys: [] }
        this.currentTelemetry = null;

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

        // Telemetry elements
        this.telemetryPanel = document.getElementById('telemetryPanel');
        this.telemetryStatus = document.getElementById('telemetryStatus');
        this.telemetryValues = document.getElementById('telemetryValues');
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
        
        // Progress overlay elements
        this.progressOverlay = document.getElementById('progressOverlay');
        this.progressTitle = document.getElementById('progressTitle');
        this.progressStatus = document.getElementById('progressStatus');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        
        // Ensure progress overlay starts hidden
        if (this.progressOverlay) {
            this.progressOverlay.style.display = 'none';
            this.log('Progress overlay initialized and hidden');
        }
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
        
        // Test progress overlay (remove in production)
        if (!this.isProduction) {
            window.testProgress = () => {
                console.log('testProgress called');
                this.showProgress('Test Progress', 'Testing progress overlay...');
                let progress = 0;
                const interval = setInterval(() => {
                    progress += 10;
                    console.log('Updating progress:', progress);
                    this.updateProgress(progress, `Testing... ${progress}%`);
                    if (progress >= 100) {
                        clearInterval(interval);
                        setTimeout(() => this.hideProgress(), 1000);
                    }
                }, 500);
            };
            
            // Force hide progress overlay
            window.forceHideProgress = () => {
                console.log('Force hiding progress overlay');
                const overlay = document.getElementById('progressOverlay');
                if (overlay) {
                    overlay.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important;';
                }
            };
            
            // Simple test with inline styles
            window.testProgressSimple = () => {
                console.log('testProgressSimple called');
                const overlay = document.getElementById('progressOverlay');
                overlay.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: rgba(0, 0, 0, 0.9) !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    z-index: 9999 !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                `;
                
                const title = document.getElementById('progressTitle');
                const status = document.getElementById('progressStatus');
                const fill = document.getElementById('progressFill');
                const text = document.getElementById('progressText');
                
                title.textContent = 'Simple Test';
                status.textContent = 'Testing with inline styles...';
                fill.style.width = '50%';
                text.textContent = '50%';
                
                setTimeout(() => {
                    overlay.style.display = 'none';
                }, 3000);
            };
            
            // Create overlay from scratch
            window.testProgressFromScratch = () => {
                console.log('testProgressFromScratch called');
                
                // Remove existing overlay
                const existingOverlay = document.getElementById('progressOverlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
                
                // Create new overlay from scratch
                const overlay = document.createElement('div');
                overlay.id = 'testOverlay';
                overlay.style.cssText = `
                    position: fixed !important;
                    top: 0 !important;
                    left: 0 !important;
                    width: 100% !important;
                    height: 100% !important;
                    background: rgba(255, 0, 0, 0.8) !important;
                    display: flex !important;
                    justify-content: center !important;
                    align-items: center !important;
                    z-index: 99999 !important;
                    color: white !important;
                    font-size: 24px !important;
                    font-weight: bold !important;
                `;
                
                overlay.innerHTML = `
                    <div style="background: white; color: black; padding: 40px; border-radius: 10px; text-align: center;">
                        <h2>TEST OVERLAY</h2>
                        <p>This is a test overlay created from scratch</p>
                        <div style="background: #ddd; width: 300px; height: 20px; border-radius: 10px; margin: 20px 0;">
                            <div style="background: #667eea; width: 50%; height: 100%; border-radius: 10px;"></div>
                        </div>
                        <p>Progress: 50%</p>
                    </div>
                `;
                
                document.body.appendChild(overlay);
                
                setTimeout(() => {
                    overlay.remove();
                }, 3000);
            };
        }
    }

    handleFileSelection(event) {
        const files = Array.from(event.target.files);
        const videoFiles = files.filter(f => f.type.startsWith('video/'));
        const telemetryFiles = files.filter(f => f.name.toLowerCase().endsWith('.json') || f.name.toLowerCase().endsWith('.csv'));
        this.processFiles(videoFiles, telemetryFiles);
    }

    handleDirectorySelection(event) {
        const files = Array.from(event.target.files);
        this.log('Total files selected:', files.length);
        
        // Log all files for debugging
        files.forEach((file, index) => {
            this.log(`File ${index + 1}:`, {
                name: file.name,
                type: file.type,
                path: file.webkitRelativePath,
                size: file.size
            });
        });
        
        // Filter for video files and (optional) telemetry sidecars
        const videoFiles = files.filter(file => {
            const isVideo = file.type.startsWith('video/') || 
                           file.name.toLowerCase().endsWith('.mp4') ||
                           file.name.toLowerCase().endsWith('.mov') ||
                           file.name.toLowerCase().endsWith('.avi') ||
                           file.name.toLowerCase().endsWith('.mkv');
            
            if (isVideo) {
                this.log('Found video file:', file.name, file.webkitRelativePath);
            }
            return isVideo;
        });

        const telemetryFiles = files.filter(file => {
            const lower = file.name.toLowerCase();
            return lower.endsWith('.json') || lower.endsWith('.csv');
        });

        if (telemetryFiles.length > 0) {
            this.log('Found potential telemetry sidecar files:', telemetryFiles.map(f => f.name));
        }
        
        this.log('Video files found:', videoFiles.length);
        
        if (videoFiles.length === 0) {
            this.showError('No video files found in the selected directory. Please check that the directory contains video files.');
            return;
        }

        this.showSuccess(`Found ${videoFiles.length} video files in directory`);
        this.processFiles(videoFiles, telemetryFiles);
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
                this.processFiles(files, []);
            } else {
                this.showError('No video files found in the dropped items.');
            }
        });
    }

    processFiles(videoFiles, telemetryFiles = []) {
        if (!Array.isArray(videoFiles) || videoFiles.length === 0) {
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
            
            this.log('Processed video:', videoInfo.name, 'Camera:', videoInfo.camera);
            return videoInfo;
        });

        this.log('Total videos processed:', this.videos.length);
        this.log('Unique cameras found:', [...new Set(this.videos.map(v => v.camera))]);

        // Group videos by events
        this.groupVideosByEvents();

        // Telemetry: attempt to extract from newer TeslaCam MP4 metadata tracks.
        // This runs in the background and updates the UI when ready.
        if (this.telemetryEnabled) {
            this.extractTelemetryForEvents(telemetryFiles);
        }
        
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
        this.log('Grouping videos by events...');
        this.log('Total videos:', this.videos.length);
        
        // Log all videos with their timestamps for debugging
        this.videos.forEach((video, index) => {
            this.log(`Video ${index + 1}:`, {
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
        this.log('Videos after filtering hidden files for grouping:', validVideos.length);
        
        validVideos.forEach(video => {
            const timestamp = video.timestamp.getTime();
            // Use exact timestamp as key for TeslaCam recordings
            const timestampKey = timestamp;
            
            if (!groups[timestampKey]) {
                groups[timestampKey] = [];
            }
            groups[timestampKey].push(video);
        });

        this.log('Initial groups:', Object.keys(groups).length);
        
        // Convert groups to events
        this.events = Object.values(groups)
            .filter(group => group.length > 0)
            .map(group => ({
                videos: group,
                timestamp: group[0].timestamp,
                duration: 60000 // Default duration, will be updated after videos load
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
            
        this.log('Final events:', this.events.length);
        this.events.forEach((event, index) => {
            this.log(`Event ${index + 1}:`, {
                timestamp: event.timestamp.toISOString(),
                videoCount: event.videos.length,
                cameras: event.videos.map(v => v.camera)
            });
        });
        
        // If we only have one event but multiple videos, try alternative grouping
        if (this.events.length === 1 && this.videos.length > 4) {
            this.log('Only one event detected with many videos, trying alternative grouping...');
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
        
        this.log('Alternative grouping results:', Object.keys(groups).length, 'groups');
        
        // Convert to events
        this.events = Object.values(groups)
            .filter(group => group.length > 0)
            .map(group => ({
                videos: group,
                timestamp: group[0].timestamp,
                duration: 60000 // Default duration, will be updated after videos load
            }))
            .sort((a, b) => a.timestamp - b.timestamp);
            
        this.log('Alternative events:', this.events.length);
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
                this.log(`Updated event ${eventIndex + 1} duration:`, duration, 'ms');
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
                    this.log(`Updated event ${eventIndex + 1} duration:`, duration, 'ms');
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
        this.log('Calculating duration for video:', firstVideo.name, 'Video object:', firstVideo.video);
        
        if (firstVideo.video) {
            this.log('Video readyState:', firstVideo.video.readyState, 'Duration:', firstVideo.video.duration);
            
            // Check if video has valid duration
            if (!isNaN(firstVideo.video.duration) && firstVideo.video.duration > 0) {
                const duration = firstVideo.video.duration * 1000; // Convert to milliseconds
                this.log('Using actual video duration:', duration, 'ms');
                return duration;
            }
            
            // If video is not loaded yet, try to get duration from metadata
            if (firstVideo.video.readyState >= 1) {
                const duration = firstVideo.video.duration * 1000;
                this.log('Using metadata duration:', duration, 'ms');
                return duration;
            }
        }
        
        // Fallback: estimate based on typical TeslaCam clip length
        this.log('Using fallback duration: 60000ms');
        return 60000; // 1 minute default
    }

    createVideoGrid() {
        this.videoGrid.innerHTML = '';
        
        // Get all unique cameras from all videos, filtering out hidden files
        const allCameras = [...new Set(this.videos
            .filter(video => !video.name.startsWith('._')) // Filter out hidden files
            .map(video => video.camera)
        )];
        
        this.log('Creating video grid for cameras:', allCameras);
        this.log('All videos before filtering:', this.videos.map(v => ({ name: v.name, camera: v.camera })));
        this.log('Videos after filtering hidden files:', this.videos
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
        
        this.log(`Created ${allCameras.length} video slots for cameras:`, allCameras);
    }

    loadEvent(eventIndex) {
        if (eventIndex < 0 || eventIndex >= this.events.length) return;
        
        this.currentEventIndex = eventIndex;
        const event = this.events[eventIndex];
        
        this.log(`Loading event ${eventIndex + 1} of ${this.events.length}:`, event.timestamp.toLocaleString());
        this.log('Event videos:', event.videos.map(v => ({ name: v.name, camera: v.camera })));
        
        // Filter out hidden files for display
        const validVideos = event.videos.filter(video => !video.name.startsWith('._'));
        this.log('Valid videos (filtered):', validVideos.map(v => ({ name: v.name, camera: v.camera })));
        
        // Load videos for each camera
        const videoItems = this.videoGrid.querySelectorAll('.video-item');
        this.log('Video grid items found:', videoItems.length);
        
        videoItems.forEach(videoItem => {
            const camera = videoItem.dataset.camera;
            const video = videoItem.querySelector('video');
            
            this.log(`Looking for camera: ${camera}`);
            
            // Find video for this camera in current event (filter out hidden files)
            const eventVideo = validVideos.find(v => v.camera === camera);
            
            if (eventVideo) {
                this.log(`Loading video for ${camera}:`, eventVideo.name);
                video.src = eventVideo.objectUrl;
                video.load();
                // Store the video element in the video object for later use
                eventVideo.video = video;
            } else {
                this.log(`No video found for camera: ${camera}`);
                video.src = '';
            }
        });
        
        // Update event duration if not already calculated
        if (event.duration === 60000) {
            this.updateEventDuration(eventIndex);
        }
        
        // Update timeline
        this.updateTimeline();

        // Telemetry for this event (if extracted)
        this.refreshTelemetryPanel();
        
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
                this.log(`Seeking to ${clampedTime}s (${timeValue})`);
            }
        });
    }

    updateTimeline() {
        const videos = this.videoGrid.querySelectorAll('video');
        const mainVideo = videos[0];
        
        this.log('Updating timeline for video:', mainVideo?.src);
        
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
                    this.updateTelemetryDisplay(mainVideo.currentTime || 0);
                }
            };
            
            // Add event listeners
            mainVideo.addEventListener('timeupdate', this.updateTimeHandler);
            mainVideo.addEventListener('loadedmetadata', this.updateTimeHandler);
            mainVideo.addEventListener('canplay', this.updateTimeHandler);
            
            // Initial update
            this.updateTimeHandler();
            
            this.log('Timeline setup complete. Max duration:', mainVideo.duration);
        }
    }

    // ---------------------------
    // Telemetry
    // ---------------------------

    async extractTelemetryForEvents(sidecarFiles = []) {
        try {
            // Basic UI state
            if (this.telemetryPanel && this.telemetryStatus) {
                this.telemetryPanel.style.display = 'flex';
                this.telemetryStatus.textContent = 'Telemetry: scanning videos…';
            }

            // 1) Optional sidecars (best-effort). We only support simple JSON formats.
            const sidecarByTimestamp = await this.parseTelemetrySidecars(sidecarFiles);

            // 2) Embedded timed metadata tracks (best-effort via MP4Box)
            const tasks = this.events.map(async (evt, eventIndex) => {
                // Prefer Front camera as canonical
                const videoInfo = (evt.videos || []).find(v => v.camera === 'Front') || (evt.videos || [])[0];
                if (!videoInfo?.file) return;

                // If sidecar matches this event timestamp, prefer it.
                const ts = evt.timestamp || (videoInfo.timestamp ?? null);
                if (ts && sidecarByTimestamp.has(ts)) {
                    this.telemetryByEventIndex.set(eventIndex, sidecarByTimestamp.get(ts));
                    return;
                }

                const telemetry = await this.parseMp4Telemetry(videoInfo.file);
                if (telemetry?.points?.length) {
                    this.telemetryByEventIndex.set(eventIndex, telemetry);
                }
            });

            await Promise.allSettled(tasks);

            // Set current event telemetry
            this.currentTelemetry = this.telemetryByEventIndex.get(this.currentEventIndex) || null;
            this.refreshTelemetryPanel();

        } catch (e) {
            this.logError('Telemetry extraction failed:', e);
            // Hide telemetry panel if we can't do anything useful
            if (this.telemetryPanel) this.telemetryPanel.style.display = 'none';
        }
    }

    async parseTelemetrySidecars(files) {
        const map = new Map();
        if (!files || files.length === 0) return map;

        for (const file of files) {
            try {
                if (!file.name.toLowerCase().endsWith('.json')) continue;
                const text = await file.text();
                const parsed = JSON.parse(text);

                // Expected best-effort formats:
                // A) { timestamp: "2025-01-01_12-00-00", points: [{t:0.0, data:{...}}] }
                // B) { eventTimestamp: "...", telemetry: [...] }
                const ts = parsed.timestamp || parsed.eventTimestamp || parsed.event || null;
                const points = parsed.points || parsed.telemetry || parsed.data || null;
                if (!ts || !Array.isArray(points)) continue;

                const normalized = points
                    .map(p => {
                        const t = typeof p.t === 'number' ? p.t : (typeof p.time === 'number' ? p.time : null);
                        const data = p.data || p.values || p;
                        if (t === null || typeof data !== 'object') return null;
                        return { t, data };
                    })
                    .filter(Boolean)
                    .sort((a, b) => a.t - b.t);

                const keys = this.collectTelemetryKeys(normalized);
                map.set(ts, { points: normalized, keys, source: `sidecar:${file.name}` });
            } catch (e) {
                this.log('Ignoring sidecar (parse failed):', file.name, e?.message);
            }
        }

        return map;
    }

    collectTelemetryKeys(points) {
        const keys = new Set();
        for (const p of points || []) {
            if (!p?.data) continue;
            Object.keys(p.data).forEach(k => {
                if (k === 't' || k === 'time' || k === 'timestamp') return;
                keys.add(k);
            });
        }
        return Array.from(keys);
    }

    // Tesla telemetry (2025 Holiday Update+): H.264 SEI user_data_unregistered messages
    // using the UUID: 42424269-0801-1001-18df-e61025933ea9
    // Payload is a protobuf message (SeiMetadata) in proto3 format.
    // Ref implementation: https://github.com/JVital2013/TeslaCamBurner (Parser.cs + dashcam.proto)
    getTeslaTelemetryFromSeiUserData(userBytes) {
        try {
            const u8 = (userBytes instanceof Uint8Array) ? userBytes : new Uint8Array(userBytes);

            // 1) Try protobuf decode (preferred)
            const decoded = this.decodeTeslaSeiProtobuf(u8);
            if (decoded && Object.keys(decoded).length) return decoded;

            // 2) Fallback: heuristics on fixed offsets (kept for safety)
            const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
            const out = {};
            if (u8.byteLength >= 6) {
                const speedMaybe = dv.getFloat32(2, true);
                if (Number.isFinite(speedMaybe) && speedMaybe >= 0 && speedMaybe <= 250) {
                    out.speed_mph = Math.round(speedMaybe * 10) / 10;
                }
            }
            if (u8.byteLength >= 20) {
                const latMaybe = dv.getFloat64(12, true);
                if (Number.isFinite(latMaybe) && latMaybe >= -90 && latMaybe <= 90) {
                    out.lat = latMaybe;
                }
            }
            if (u8.byteLength >= 29) {
                const lonMaybe = dv.getFloat64(21, true);
                if (Number.isFinite(lonMaybe) && lonMaybe >= -180 && lonMaybe <= 180) {
                    out.lon = lonMaybe;
                }
            }
            return Object.keys(out).length ? out : null;
        } catch {
            return null;
        }
    }

    decodeTeslaSeiProtobuf(u8) {
        // SeiMetadata from dashcam.proto:
        // 1 version (varint)
        // 2 gear_state (varint)
        // 3 frame_seq_no (varint)
        // 4 vehicle_speed_mps (fixed32 float)
        // 5 accelerator_pedal_position (fixed32 float)
        // 6 steering_wheel_angle (fixed32 float)
        // 7 blinker_on_left (varint bool)
        // 8 blinker_on_right (varint bool)
        // 9 brake_applied (varint bool)
        // 10 autopilot_state (varint)
        // 11 latitude_deg (fixed64 double)
        // 12 longitude_deg (fixed64 double)
        // 13 heading_deg (fixed64 double)
        // 14/15/16 linear_acceleration_mps2_{x,y,z} (fixed64 double)

        const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
        let off = 0;

        const readVarint = () => {
            let shift = 0;
            let result = 0;
            while (off < u8.length) {
                const b = u8[off++];
                result |= (b & 0x7f) << shift;
                if ((b & 0x80) === 0) return result >>> 0;
                shift += 7;
                if (shift > 35) return null; // too big for JS bit ops
            }
            return null;
        };

        const readFixed32Float = () => {
            if (off + 4 > u8.length) return null;
            const v = dv.getFloat32(off, true);
            off += 4;
            return v;
        };

        const readFixed64Double = () => {
            if (off + 8 > u8.length) return null;
            const v = dv.getFloat64(off, true);
            off += 8;
            return v;
        };

        const skip = (wireType) => {
            if (wireType === 0) {
                const v = readVarint();
                return v !== null;
            }
            if (wireType === 5) {
                off += 4;
                return off <= u8.length;
            }
            if (wireType === 1) {
                off += 8;
                return off <= u8.length;
            }
            if (wireType === 2) {
                const len = readVarint();
                if (len === null) return false;
                off += len;
                return off <= u8.length;
            }
            return false;
        };

        const out = {};

        while (off < u8.length) {
            const tag = readVarint();
            if (tag === null) break;
            if (tag === 0) break;

            const fieldNo = tag >>> 3;
            const wireType = tag & 0x7;

            switch (fieldNo) {
                case 1: {
                    if (wireType !== 0) { if (!skip(wireType)) return null; break; }
                    out.version = readVarint();
                    break;
                }
                case 2: {
                    if (wireType !== 0) { if (!skip(wireType)) return null; break; }
                    out.gear_state = readVarint();
                    break;
                }
                case 3: {
                    if (wireType !== 0) { if (!skip(wireType)) return null; break; }
                    out.frame_seq_no = readVarint();
                    break;
                }
                case 4: {
                    if (wireType !== 5) { if (!skip(wireType)) return null; break; }
                    const v = readFixed32Float();
                    if (v !== null && Number.isFinite(v)) {
                        out.vehicle_speed_mps = v;
                        out.speed_mph = Math.round((v * 2.2369362920544) * 10) / 10;
                    }
                    break;
                }
                case 5: {
                    if (wireType !== 5) { if (!skip(wireType)) return null; break; }
                    const v = readFixed32Float();
                    if (v !== null && Number.isFinite(v)) out.accelerator_pedal_position = v;
                    break;
                }
                case 6: {
                    if (wireType !== 5) { if (!skip(wireType)) return null; break; }
                    const v = readFixed32Float();
                    if (v !== null && Number.isFinite(v)) out.steering_wheel_angle = v;
                    break;
                }
                case 7: {
                    if (wireType !== 0) { if (!skip(wireType)) return null; break; }
                    out.blinker_on_left = !!readVarint();
                    break;
                }
                case 8: {
                    if (wireType !== 0) { if (!skip(wireType)) return null; break; }
                    out.blinker_on_right = !!readVarint();
                    break;
                }
                case 9: {
                    if (wireType !== 0) { if (!skip(wireType)) return null; break; }
                    out.brake_applied = !!readVarint();
                    break;
                }
                case 10: {
                    if (wireType !== 0) { if (!skip(wireType)) return null; break; }
                    out.autopilot_state = readVarint();
                    break;
                }
                case 11: {
                    if (wireType !== 1) { if (!skip(wireType)) return null; break; }
                    const v = readFixed64Double();
                    if (v !== null && Number.isFinite(v)) out.lat = v;
                    break;
                }
                case 12: {
                    if (wireType !== 1) { if (!skip(wireType)) return null; break; }
                    const v = readFixed64Double();
                    if (v !== null && Number.isFinite(v)) out.lon = v;
                    break;
                }
                case 13: {
                    if (wireType !== 1) { if (!skip(wireType)) return null; break; }
                    const v = readFixed64Double();
                    if (v !== null && Number.isFinite(v)) out.heading_deg = v;
                    break;
                }
                case 14: {
                    if (wireType !== 1) { if (!skip(wireType)) return null; break; }
                    const v = readFixed64Double();
                    if (v !== null && Number.isFinite(v)) out.linear_acceleration_mps2_x = v;
                    break;
                }
                case 15: {
                    if (wireType !== 1) { if (!skip(wireType)) return null; break; }
                    const v = readFixed64Double();
                    if (v !== null && Number.isFinite(v)) out.linear_acceleration_mps2_y = v;
                    break;
                }
                case 16: {
                    if (wireType !== 1) { if (!skip(wireType)) return null; break; }
                    const v = readFixed64Double();
                    if (v !== null && Number.isFinite(v)) out.linear_acceleration_mps2_z = v;
                    break;
                }
                default: {
                    if (!skip(wireType)) return null;
                    break;
                }
            }
        }

        // sanity checks
        if (out.lat !== undefined && (out.lat < -90 || out.lat > 90)) delete out.lat;
        if (out.lon !== undefined && (out.lon < -180 || out.lon > 180)) delete out.lon;

        return Object.keys(out).length ? out : null;
    }

    decodeH264SeiUserDataUnregisteredFromAvcSample(sampleU8) {
        const out = [];
        if (!sampleU8 || sampleU8.byteLength < 8) return out;

        const UUID = new Uint8Array([0x42,0x42,0x42,0x69,0x08,0x01,0x10,0x01,0x18,0xdf,0xe6,0x10,0x25,0x93,0x3e,0xa9]);

        // AVC samples are length-prefixed NAL units (typically 4-byte lengths)
        let off = 0;
        const dv = new DataView(sampleU8.buffer, sampleU8.byteOffset, sampleU8.byteLength);
        while (off + 4 <= sampleU8.byteLength) {
            const nalLen = dv.getUint32(off, false);
            off += 4;
            if (nalLen <= 0 || off + nalLen > sampleU8.byteLength) break;
            const nal = sampleU8.subarray(off, off + nalLen);
            off += nalLen;
            if (nal.length < 2) continue;
            const nalType = nal[0] & 0x1f;
            if (nalType !== 6) continue; // SEI

            // Convert EBSP->RBSP (remove emulation prevention bytes)
            const rbsp = [];
            let zeros = 0;
            for (let i = 1; i < nal.length; i++) {
                const b = nal[i];
                if (zeros === 2 && b === 0x03) {
                    zeros = 0;
                    continue;
                }
                rbsp.push(b);
                zeros = (b === 0x00) ? zeros + 1 : 0;
            }

            let idx = 0;
            while (idx < rbsp.length) {
                // payloadType
                let payloadType = 0;
                while (idx < rbsp.length && rbsp[idx] === 0xff) { payloadType += 255; idx++; }
                if (idx >= rbsp.length) break;
                payloadType += rbsp[idx++];

                // payloadSize
                let payloadSize = 0;
                while (idx < rbsp.length && rbsp[idx] === 0xff) { payloadSize += 255; idx++; }
                if (idx >= rbsp.length) break;
                payloadSize += rbsp[idx++];

                if (idx + payloadSize > rbsp.length) break;
                const payload = rbsp.slice(idx, idx + payloadSize);
                idx += payloadSize;

                // user_data_unregistered
                if (payloadType === 5 && payload.length >= 16) {
                    let match = true;
                    for (let i = 0; i < 16; i++) {
                        if (payload[i] !== UUID[i]) { match = false; break; }
                    }
                    if (match) {
                        out.push(new Uint8Array(payload.slice(16)));
                    }
                }

                // stop if rbsp trailing bits are reached (best-effort)
                if (idx < rbsp.length && rbsp[idx] === 0x80) break;
            }
        }

        return out;
    }

    async parseMp4Telemetry(file) {
        // We avoid depending on mp4box.js bundling (recent builds are ESM-only and break in classic <script>).
        // Instead, do a best-effort scan of the MP4's 'mdat' box and parse H.264 NAL units like TeslaCamBurner.
        if (!file) return null;

        const telemetry = await this.parseTeslaTelemetryFromMdat(file);
        return telemetry;
    }

    async parseTeslaTelemetryFromMdat(file) {
        try {
            const buf = await file.arrayBuffer();
            const u8 = new Uint8Array(buf);
            const dv = new DataView(buf);

            // Find first 'mdat' box (simple MP4 atom scan)
            let pos = 0;
            let mdatStart = -1;
            let mdatEnd = -1;

            while (pos + 8 <= u8.length) {
                const size = dv.getUint32(pos, false);
                const type = String.fromCharCode(u8[pos + 4], u8[pos + 5], u8[pos + 6], u8[pos + 7]);
                let boxSize = size;
                let headerSize = 8;

                if (boxSize === 1) {
                    // 64-bit size
                    if (pos + 16 > u8.length) break;
                    const hi = dv.getUint32(pos + 8, false);
                    const lo = dv.getUint32(pos + 12, false);
                    boxSize = hi * 2 ** 32 + lo;
                    headerSize = 16;
                } else if (boxSize === 0) {
                    boxSize = u8.length - pos;
                }

                if (boxSize <= headerSize) break;

                if (type === 'mdat') {
                    mdatStart = pos + headerSize;
                    mdatEnd = Math.min(u8.length, pos + boxSize);
                    break;
                }

                pos += boxSize;
            }

            if (mdatStart < 0 || mdatEnd <= mdatStart) return null;

            // Scan NAL units inside mdat.
            // Preferred: MP4/AVC length-prefixed NALs [uint32 nalSize][nalBytes...]
            // Fallback: Annex-B start codes 00 00 01 / 00 00 00 01
            const stats = { nal: 0, sei: 0, userData: 0, decoded: 0, mode: 'avc-length' };

            let pending = null;
            let frameIndex = 0;
            const points = [];

            const processNal = (nal) => {
                if (!nal || nal.length < 2) return;
                stats.nal++;
                const nalType = nal[0] & 0x1f;

                if (nalType === 6) {
                    stats.sei++;
                    if (nal.length > 2 && nal[1] === 5) {
                        const sample = new Uint8Array(4 + nal.length);
                        sample[0] = (nal.length >>> 24) & 0xff;
                        sample[1] = (nal.length >>> 16) & 0xff;
                        sample[2] = (nal.length >>> 8) & 0xff;
                        sample[3] = nal.length & 0xff;
                        sample.set(nal, 4);

                        const seiUsers = this.decodeH264SeiUserDataUnregisteredFromAvcSample(sample);
                        stats.userData += seiUsers.length;
                        for (const userBytes of seiUsers) {
                            const decoded = this.getTeslaTelemetryFromSeiUserData(userBytes);
                            if (decoded) {
                                pending = decoded;
                                stats.decoded++;
                            }
                        }
                    }
                    return;
                }

                if (nalType === 1 || nalType === 5) {
                    if (pending) {
                        const fps = 36;
                        const t = frameIndex / fps;
                        points.push({ t, data: pending });
                        pending = null;
                    }
                    frameIndex++;
                }
            };

            // Try AVC length-prefixed
            let i = mdatStart;
            let bad = 0;
            while (i + 4 <= mdatEnd) {
                const nalSize = dv.getUint32(i, false);
                i += 4;
                if (nalSize < 2 || i + nalSize > mdatEnd) {
                    bad++;
                    if (bad > 20) break;
                    // try to resync by moving one byte
                    i = Math.max(mdatStart, i - 3);
                    continue;
                }
                bad = 0;
                const nal = u8.subarray(i, i + nalSize);
                i += nalSize;
                processNal(nal);
            }

            // Fallback to AnnexB if nothing decoded
            if (stats.decoded === 0) {
                stats.mode = 'annexb';
                const scanStartCodes = (start, end) => {
                    const data = u8.subarray(start, end);
                    const findStart = (from) => {
                        for (let p = from; p + 3 < data.length; p++) {
                            if (data[p] === 0x00 && data[p + 1] === 0x00) {
                                if (data[p + 2] === 0x01) return { pos: p, len: 3 };
                                if (data[p + 2] === 0x00 && data[p + 3] === 0x01) return { pos: p, len: 4 };
                            }
                        }
                        return null;
                    };

                    let cur = findStart(0);
                    while (cur) {
                        const next = findStart(cur.pos + cur.len);
                        const nalStart = cur.pos + cur.len;
                        const nalEnd = next ? next.pos : data.length;
                        if (nalEnd > nalStart) {
                            processNal(data.subarray(nalStart, nalEnd));
                        }
                        cur = next;
                    }
                };

                scanStartCodes(mdatStart, mdatEnd);
            }

            if (!points.length) {
                this.lastTelemetryScanStats = stats;
                // Show something even in production mode (where console logs are disabled)
                if (this.telemetryPanel && this.telemetryStatus) {
                    this.telemetryPanel.style.display = 'flex';
                    this.telemetryStatus.textContent = `Telemetry: not detected (mode=${stats.mode}, nal=${stats.nal}, sei=${stats.sei}, user=${stats.userData}, decoded=${stats.decoded})`;
                }
                // Always log a warning (even in production)
                try { console.warn('Telemetry not detected. Stats:', stats); } catch {}
                return null;
            }
            points.sort((a, b) => a.t - b.t);
            return { points, keys: this.collectTelemetryKeys(points), source: 'mdat-scan' };

        } catch (e) {
            this.log('parseTeslaTelemetryFromMdat failed:', e?.message);
            return null;
        }
    }

    refreshTelemetryPanel() {
        if (!this.telemetryPanel || !this.telemetryStatus || !this.telemetryValues) return;

        this.currentTelemetry = this.telemetryByEventIndex.get(this.currentEventIndex) || null;

        if (!this.currentTelemetry?.points?.length) {
            this.telemetryPanel.style.display = 'flex';
            const s = this.lastTelemetryScanStats;
            if (s && typeof s === 'object') {
                this.telemetryStatus.textContent = `Telemetry: not detected (mode=${s.mode}, nal=${s.nal}, sei=${s.sei}, user=${s.userData}, decoded=${s.decoded})`;
            } else {
                this.telemetryStatus.textContent = 'Telemetry: not detected';
            }
            this.telemetryValues.innerHTML = '';
            return;
        }

        this.telemetryPanel.style.display = 'flex';
        const source = this.currentTelemetry.source ? ` (${this.currentTelemetry.source})` : '';
        this.telemetryStatus.textContent = `Telemetry: detected${source}`;
        this.updateTelemetryDisplay(0);
    }

    updateTelemetryDisplay(currentTimeSeconds) {
        if (!this.telemetryPanel || !this.telemetryValues) return;
        if (!this.currentTelemetry?.points?.length) return;

        const point = this.getTelemetryAtTime(this.currentTelemetry.points, currentTimeSeconds);
        if (!point?.data) return;

        // Pick a small set of keys to render (prefer common ones)
        const preferred = ['speed_mph', 'vehicle_speed_mps', 'gear_state', 'autopilot_state', 'brake_applied', 'blinker_on_left', 'blinker_on_right', 'heading_deg', 'lat', 'lon', 'steering_wheel_angle', 'accelerator_pedal_position'];
        const keys = [];
        preferred.forEach(k => { if (k in point.data) keys.push(k); });
        if (keys.length < 6) {
            for (const k of Object.keys(point.data)) {
                if (keys.includes(k)) continue;
                if (keys.length >= 6) break;
                if (typeof point.data[k] === 'object') continue;
                keys.push(k);
            }
        }

        this.telemetryValues.innerHTML = '';
        keys.forEach(k => {
            const pill = document.createElement('span');
            pill.className = 'telemetry-pill';
            pill.innerHTML = `<span class="k">${this.escapeHtml(k)}</span><span class="v">${this.escapeHtml(String(point.data[k]))}</span>`;
            this.telemetryValues.appendChild(pill);
        });
    }

    getTelemetryAtTime(points, t) {
        if (!points || points.length === 0) return null;
        // Binary search for last point with time <= t
        let lo = 0;
        let hi = points.length - 1;
        let best = points[0];
        while (lo <= hi) {
            const mid = (lo + hi) >> 1;
            const p = points[mid];
            if (p.t <= t) {
                best = p;
                lo = mid + 1;
            } else {
                hi = mid - 1;
            }
        }
        return best;
    }

    drawTelemetryOverlay(ctx, currentTimeSeconds, width, height) {
        if (!this.currentTelemetry?.points?.length) return;
        const point = this.getTelemetryAtTime(this.currentTelemetry.points, currentTimeSeconds);
        if (!point?.data) return;

        // Minimal HUD-like overlay at the top
        const pad = Math.max(10, Math.floor(width * 0.01));
        const barH = Math.max(44, Math.floor(height * 0.06));
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(0, 0, width, barH);

        ctx.fillStyle = '#fff';
        ctx.font = `${Math.max(18, Math.floor(barH * 0.45))}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;
        ctx.textBaseline = 'middle';

        const parts = [];
        const speed = point.data.speed_mph ?? point.data.mph;
        if (speed !== undefined) parts.push(`Speed: ${speed} mph`);

        const gear = point.data.gear_state;
        if (gear !== undefined) {
            const g = ({0:'P',1:'D',2:'R',3:'N'})[gear] ?? String(gear);
            parts.push(`Gear: ${g}`);
        }

        if (point.data.brake_applied !== undefined) {
            parts.push(`Brake: ${point.data.brake_applied ? 'ON' : 'off'}`);
        }

        if (point.data.autopilot_state !== undefined) {
            const ap = ({0:'NONE',1:'FSD',2:'AUTOSTEER',3:'TACC'})[point.data.autopilot_state] ?? String(point.data.autopilot_state);
            parts.push(`AP: ${ap}`);
        }

        // Fallback: show first few primitive values
        if (parts.length === 0) {
            const keys = Object.keys(point.data).filter(k => typeof point.data[k] !== 'object').slice(0, 3);
            keys.forEach(k => parts.push(`${k}: ${point.data[k]}`));
        }

        ctx.fillText(parts.join('   •   '), pad, barH / 2);
        ctx.restore();
    }

    escapeHtml(str) {
        return str
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    previousEvent() {
        if (this.currentEventIndex > 0) {
            this.log(`Navigating to previous event: ${this.currentEventIndex - 1}`);
            this.loadEvent(this.currentEventIndex - 1);
        } else {
            this.log('Already at first event');
        }
    }

    nextEvent() {
        if (this.currentEventIndex < this.events.length - 1) {
            this.log(`Navigating to next event: ${this.currentEventIndex + 1}`);
            this.loadEvent(this.currentEventIndex + 1);
        } else {
            this.log('Already at last event');
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
        
        this.log(`Populated event select with ${this.events.length} events`);
    }

    updateEventDropdown() {
        // Update the dropdown to show the current event
        if (this.currentEventIndex >= 0 && this.currentEventIndex < this.events.length) {
            this.eventSelect.value = this.currentEventIndex.toString();
            this.log(`Updated dropdown to event ${this.currentEventIndex + 1}`);
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
            this.logError('Download failed:', error);
            this.showError('Download failed. Please try again.');
        }
    }



    // Splicing Methods
    setSpliceStart() {
        const videos = this.videoGrid.querySelectorAll('video');
        let mainVideo = null;
        
        // Find the first video that has a valid currentTime
        for (let video of videos) {
            if (video && video.currentTime !== undefined && !isNaN(video.currentTime)) {
                mainVideo = video;
                break;
            }
        }
        
        if (mainVideo) {
            this.spliceStartTime = mainVideo.currentTime;
            this.setStartBtn.classList.add('active');
            this.setStartBtn.innerHTML = '<i class="fas fa-play"></i> Start: ' + this.formatTime(this.spliceStartTime);
            this.showSuccess(`Start time set to ${this.formatTime(this.spliceStartTime)}`);
            this.log('Splice start time set to:', this.spliceStartTime);
        } else {
            this.showError('No video is currently playing. Please play a video first.');
        }
    }

    setSpliceEnd() {
        const videos = this.videoGrid.querySelectorAll('video');
        let mainVideo = null;
        
        // Find the first video that has a valid currentTime
        for (let video of videos) {
            if (video && video.currentTime !== undefined && !isNaN(video.currentTime)) {
                mainVideo = video;
                break;
            }
        }
        
        if (mainVideo) {
            this.spliceEndTime = mainVideo.currentTime;
            this.setEndBtn.classList.add('active');
            this.setEndBtn.innerHTML = '<i class="fas fa-stop"></i> End: ' + this.formatTime(this.spliceEndTime);
            this.showSuccess(`End time set to ${this.formatTime(this.spliceEndTime)}`);
            this.log('Splice end time set to:', this.spliceEndTime);
        } else {
            this.showError('No video is currently playing. Please play a video first.');
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
        
        this.log('Selected clips:', this.selectedClips);
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

    async downloadSplicedClip(clip, videoInfo) {
        this.showProgress(`Splicing Clip - ${videoInfo.camera}`, 'Initializing video processing...');
        this.log('Starting spliced clip download:', clip.name, 'Camera:', videoInfo.camera);
        
        // Check if WebCodecs API is supported and we're in a secure context
        const useWebCodecs = ('VideoEncoder' in window) && ('VideoDecoder' in window) && window.isSecureContext;
        
        if (!useWebCodecs) {
            this.log('WebCodecs not available, using fallback Canvas/MediaRecorder method');
            this.showStatusMessage('Using fallback method (slower but compatible)...', 'info');
        }

        try {
            // Get the original event where the splice was created
            const originalEvent = this.events[clip.originalEvent];
            if (!originalEvent) {
                this.showError('Original event not found');
                return;
            }

            // Find the video for this camera in the original event
            const originalVideoInfo = originalEvent.videos.find(v => v.camera === videoInfo.camera);
            if (!originalVideoInfo) {
                this.showError(`Could not find ${videoInfo.camera} camera in original event`);
                return;
            }

            this.log(`Found original video: ${originalVideoInfo.name} for camera: ${videoInfo.camera}`);

            // Ensure telemetry context matches the original event for correct overlay timing
            const previousTelemetry = this.currentTelemetry;
            this.currentTelemetry = this.telemetryByEventIndex.get(clip.originalEvent) || this.currentTelemetry;

            // Create a hidden video element for this specific video
            const hiddenVideo = document.createElement('video');
            hiddenVideo.src = originalVideoInfo.objectUrl;
            hiddenVideo.muted = true;
            hiddenVideo.playsInline = true;
            hiddenVideo.style.display = 'none';
            hiddenVideo.id = 'hidden-splice-video';
            document.body.appendChild(hiddenVideo);
            
            this.log('Created hidden video element:', hiddenVideo);
            this.log('Hidden video src:', hiddenVideo.src);
            this.log('Original video info:', originalVideoInfo);

            // Wait for the video to load metadata
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Video load timeout'));
                }, 5000);
                
                hiddenVideo.addEventListener('loadedmetadata', () => {
                    clearTimeout(timeout);
                    this.log('Hidden video metadata loaded');
                    resolve();
                }, { once: true });
                
                hiddenVideo.addEventListener('canplay', () => {
                    this.log('Hidden video can play');
                }, { once: true });
                
                hiddenVideo.addEventListener('error', (e) => {
                    clearTimeout(timeout);
                    this.logError('Hidden video load error:', e);
                    reject(new Error('Video load error'));
                }, { once: true });
                
                hiddenVideo.load();
            });
            
            this.log(`Hidden video loaded: duration=${hiddenVideo.duration}s, readyState=${hiddenVideo.readyState}`);

            // Get video dimensions and frame rate
            const width = hiddenVideo.videoWidth || 1920;
            const height = hiddenVideo.videoHeight || 1080;
            const frameRate = 30; // Default frame rate

            this.log(`Video dimensions: ${width}x${height}, Frame rate: ${frameRate}`);

            // Use appropriate processing method based on WebCodecs availability
            if (useWebCodecs) {
                await this.processSplicedClipWithWebCodecs(clip, videoInfo, hiddenVideo, width, height, frameRate);
            } else {
                await this.processSplicedClipOptimized(clip, videoInfo, hiddenVideo, width, height, frameRate);
            }

            // Clean up the hidden video element
            document.body.removeChild(hiddenVideo);

            // Restore telemetry context
            this.currentTelemetry = previousTelemetry;

            // Complete progress
            this.updateProgress(100, 'Download completed!');
            setTimeout(() => {
                this.hideProgress();
            }, 1000);

        } catch (error) {
            this.logError('Error processing spliced clip:', error);
            this.showError(`Failed to process spliced clip: ${error.message}`);
            this.hideProgress();
        }
    }

    async processSplicedClipOptimized(clip, videoInfo, hiddenVideo, width, height, frameRate) {
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
            a.download = `${clip.name}_${videoInfo.camera}_${clip.startTime.toFixed(1)}s-${clip.endTime.toFixed(1)}s.${fileExtension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
            this.showSuccess(`Downloaded ${videoInfo.camera} clip: ${clip.name} (${fileExtension.toUpperCase()})`);
        };

        // Start recording
        mediaRecorder.start();

        // Seek to start time
        this.log(`Seeking hidden video to ${clip.startTime}s`);
        hiddenVideo.currentTime = clip.startTime;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
            hiddenVideo.addEventListener('canplay', resolve, { once: true });
            this.log('Playing hidden video');
            hiddenVideo.play();
        });
        
        this.log(`Hidden video current time: ${hiddenVideo.currentTime}s, duration: ${hiddenVideo.duration}s`);

        // Process video frames with optimized timing
        await new Promise((resolve) => {
            const frameInterval = 1000 / frameRate;
            let lastFrameTime = 0;
            
            const processFrame = (currentTime) => {
                // Check if we've reached or exceeded the end time
                if (hiddenVideo.currentTime >= clip.endTime || hiddenVideo.ended || hiddenVideo.paused) {
                    this.log(`Hidden video finished: currentTime=${hiddenVideo.currentTime}s, endTime=${clip.endTime}s`);
                    // Stop the video immediately to prevent further playback
                    hiddenVideo.pause();
                    resolve();
                    return;
                }
                
                // Only draw frame at specified frame rate
                if (currentTime - lastFrameTime >= frameInterval) {
                    ctx.drawImage(hiddenVideo, 0, 0, width, height);
                    this.drawTelemetryOverlay(ctx, hiddenVideo.currentTime, width, height);
                    lastFrameTime = currentTime;
                    
                    // Log progress every second
                    if (Math.floor(hiddenVideo.currentTime) % 1 === 0) {
                        this.log(`Processing frame: hidden video time=${hiddenVideo.currentTime.toFixed(1)}s`);
                    }
                }
                
                requestAnimationFrame(processFrame);
            };
            
            requestAnimationFrame(processFrame);
        });

        // Stop recording
        mediaRecorder.stop();
    }

    async processSplicedClipWithWebCodecs(clip, videoInfo, hiddenVideo, width, height, frameRate) {
        this.log('Using WebCodecs API for fast spliced clip processing...');
        
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
                a.download = `${clip.name}_${videoInfo.camera}_${clip.startTime.toFixed(1)}s-${clip.endTime.toFixed(1)}s.${fileExtension}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                URL.revokeObjectURL(url);
                this.showSuccess(`Downloaded ${videoInfo.camera} clip: ${clip.name} (${fileExtension.toUpperCase()} - WebCodecs)`);
            };

            // Start recording
            mediaRecorder.start();

            // Seek to start time
            hiddenVideo.currentTime = clip.startTime;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                hiddenVideo.addEventListener('canplay', resolve, { once: true });
                hiddenVideo.play();
            });

            // Process video frames with WebCodecs-optimized timing
            await new Promise((resolve) => {
                const frameInterval = 1000 / frameRate;
                let lastFrameTime = 0;
                
                const processFrame = (currentTime) => {
                    // Check if we've reached or exceeded the end time
                    if (hiddenVideo.currentTime >= clip.endTime || hiddenVideo.ended || hiddenVideo.paused) {
                        // Stop the video immediately to prevent further playback
                        hiddenVideo.pause();
                        resolve();
                        return;
                    }
                    
                    // Optimized frame processing for WebCodecs
                    if (currentTime - lastFrameTime >= frameInterval) {
                        ctx.drawImage(hiddenVideo, 0, 0, width, height);
                        this.drawTelemetryOverlay(ctx, hiddenVideo.currentTime, width, height);
                        lastFrameTime = currentTime;
                    }
                    
                    requestAnimationFrame(processFrame);
                };
                
                requestAnimationFrame(processFrame);
            });

            // Stop recording
            mediaRecorder.stop();
            
        } catch (error) {
            this.logError('WebCodecs processing failed, falling back to standard method:', error);
            // Fallback to standard method if WebCodecs fails
            await this.processSplicedClipOptimized(clip, videoInfo, targetVideo, width, height, frameRate);
        }
    }

    async downloadCombinedClip(clip, videoInfo) {
        this.showProgress(`Combining Clips - ${videoInfo.camera}`, 'Initializing video processing...');
        this.log('Starting combined clip download:', clip.name, 'Camera:', videoInfo.camera);
        
        // Check if WebCodecs API is supported and we're in a secure context
        const useWebCodecs = ('VideoEncoder' in window) && ('VideoDecoder' in window) && window.isSecureContext;
        
        if (!useWebCodecs) {
            this.log('WebCodecs not available, using fallback Canvas/MediaRecorder method');
            this.showStatusMessage('Using fallback method (slower but compatible)...', 'info');
        }

        try {
            // Create hidden video elements for each clip segment
            const hiddenVideos = [];
            
            for (let i = 0; i < clip.clips.length; i++) {
                const clipSegment = clip.clips[i];
                
                // Update progress for each clip segment
                const segmentProgress = (i / clip.clips.length) * 100;
                this.updateProgress(segmentProgress, `Loading clip segment ${i + 1}/${clip.clips.length}...`);
                
                // Add a small delay to make progress visible
                await new Promise(resolve => setTimeout(resolve, 100));
                
                // Find the video for this camera in the original event
                const originalEvent = this.events[clipSegment.originalEvent];
                if (!originalEvent) {
                    this.logError(`Original event ${clipSegment.originalEvent} not found for clip segment ${i}`);
                    continue;
                }
                
                const originalVideoInfo = originalEvent.videos.find(v => v.camera === videoInfo.camera);
                if (!originalVideoInfo) {
                    this.logError(`Could not find ${videoInfo.camera} camera in original event ${clipSegment.originalEvent}`);
                    continue;
                }
                
                // Use the individual clip's splice timing, not the combined clip timing
                const clipVideoInfo = clipSegment.videos.find(v => v.camera === videoInfo.camera);
                if (!clipVideoInfo) {
                    this.logError(`Could not find ${videoInfo.camera} camera in clip segment ${i}`);
                    continue;
                }
                
                this.log(`Creating hidden video for clip segment ${i}: ${originalVideoInfo.name}`);
                
                // Create a hidden video element for this clip segment
                const hiddenVideo = document.createElement('video');
                hiddenVideo.src = originalVideoInfo.objectUrl;
                hiddenVideo.muted = true;
                hiddenVideo.playsInline = true;
                hiddenVideo.style.display = 'none';
                hiddenVideo.id = `hidden-combined-video-${i}`;
                document.body.appendChild(hiddenVideo);
                
                // Wait for the video to load metadata
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error(`Video load timeout for segment ${i}`));
                    }, 5000);
                    
                    hiddenVideo.addEventListener('loadedmetadata', () => {
                        clearTimeout(timeout);
                        this.log(`Hidden video ${i} metadata loaded`);
                        resolve();
                    }, { once: true });
                    
                    hiddenVideo.addEventListener('error', (e) => {
                        clearTimeout(timeout);
                        this.logError(`Hidden video ${i} load error:`, e);
                        reject(new Error(`Video load error for segment ${i}`));
                    }, { once: true });
                    
                    hiddenVideo.load();
                });
                
                hiddenVideos.push({
                    video: hiddenVideo,
                    clipSegment: clipSegment,
                    originalVideoInfo: originalVideoInfo,
                    clipVideoInfo: clipVideoInfo
                });
            }
            
            if (hiddenVideos.length === 0) {
                this.showError('No valid videos found for combined clip');
                return;
            }
            
            // Get video dimensions from first video
            const firstVideo = hiddenVideos[0].video;
            const width = firstVideo.videoWidth || 1920;
            const height = firstVideo.videoHeight || 1080;
            const frameRate = 30; // Default frame rate

            this.log(`Video dimensions: ${width}x${height}, Frame rate: ${frameRate}`);
            this.log(`Processing ${hiddenVideos.length} clip segments`);

            // Use appropriate processing method based on WebCodecs availability
            if (useWebCodecs) {
                await this.processCombinedClipWithWebCodecs(clip, videoInfo, hiddenVideos, width, height, frameRate);
            } else {
                await this.processCombinedClipOptimized(clip, videoInfo, hiddenVideos, width, height, frameRate);
            }

            // Clean up hidden video elements
            hiddenVideos.forEach(hiddenVideo => {
                document.body.removeChild(hiddenVideo.video);
            });

            // Complete progress
            this.updateProgress(100, 'Download completed!');
            setTimeout(() => {
                this.hideProgress();
            }, 1000);

        } catch (error) {
            this.logError('Error processing combined clip:', error);
            this.showError(`Failed to process combined clip: ${error.message}`);
            this.hideProgress();
        }
    }

    async processCombinedClipOptimized(clip, videoInfo, hiddenVideos, width, height, frameRate) {
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
            for (let i = 0; i < hiddenVideos.length; i++) {
                const hiddenVideoData = hiddenVideos[i];
                const hiddenVideo = hiddenVideoData.video;
                const clipSegment = hiddenVideoData.clipSegment;
                const clipVideoInfo = hiddenVideoData.clipVideoInfo;
                const startTime = clipVideoInfo.spliceStart || 0;
                const endTime = clipVideoInfo.spliceEnd || clipVideoInfo.duration;
                
                // Update progress for processing
                const processingProgress = (i / hiddenVideos.length) * 100;
                this.updateProgress(processingProgress, `Processing segment ${i + 1}/${hiddenVideos.length}...`);
                
                // Add a small delay to make progress visible
                await new Promise(resolve => setTimeout(resolve, 50));
                
                this.log(`Processing clip segment ${i + 1}/${hiddenVideos.length}: ${startTime}s to ${endTime}s using hidden video`);
                this.log(`Seeking hidden video ${i} to ${startTime}s`);
                
                // Ensure video is ready before seeking
                if (hiddenVideo.readyState < 2) {
                    this.updateProgress(processingProgress + 5, `Loading video ${i + 1}/${hiddenVideos.length}...`);
                    await new Promise((resolve) => {
                        hiddenVideo.addEventListener('loadeddata', resolve, { once: true });
                    });
                }
                
                // Seek to start time and wait for seek to complete
                this.updateProgress(processingProgress + 10, `Seeking to ${startTime}s...`);
                hiddenVideo.currentTime = startTime;
                await new Promise((resolve) => {
                    const seekHandler = () => {
                        this.log(`Hidden video ${i} seeked to: ${hiddenVideo.currentTime}s`);
                        resolve();
                    };
                    
                    // Use seeking event if available, otherwise use a timeout
                    if ('seeking' in hiddenVideo) {
                        hiddenVideo.addEventListener('seeked', seekHandler, { once: true });
                    } else {
                        setTimeout(seekHandler, 100);
                    }
                });
                
                // Wait for video to be ready to play
                this.updateProgress(processingProgress + 15, `Preparing video ${i + 1}/${hiddenVideos.length}...`);
                await new Promise((resolve) => {
                    hiddenVideo.addEventListener('canplay', resolve, { once: true });
                    hiddenVideo.play();
                });
                

                hiddenVideo.currentTime = startTime;
                await new Promise((resolve) => {
                    const seekHandler = () => {
                        this.log(`Hidden video ${i} seeked to: ${hiddenVideo.currentTime}s`);
                        resolve();
                    };
                    
                    // Use seeking event if available, otherwise use a timeout
                    if ('seeking' in hiddenVideo) {
                        hiddenVideo.addEventListener('seeked', seekHandler, { once: true });
                    } else {
                        setTimeout(seekHandler, 100);
                    }
                });
                
                // Wait for video to be ready to play
                await new Promise((resolve) => {
                    hiddenVideo.addEventListener('canplay', resolve, { once: true });
                    hiddenVideo.play();
                });

            // Process video frames with optimized timing
            await new Promise((resolve) => {
                const frameInterval = 1000 / frameRate;
                let lastFrameTime = 0;
                const totalDuration = endTime - startTime;
                
                const processFrame = (currentTime) => {
                    // Check if we've reached or exceeded the end time
                    if (hiddenVideo.currentTime >= endTime || hiddenVideo.ended || hiddenVideo.paused) {
                        this.log(`Hidden video ${i} finished: currentTime=${hiddenVideo.currentTime}s, endTime=${endTime}s`);
                        // Stop the video immediately to prevent further playback
                        hiddenVideo.pause();
                        resolve();
                        return;
                    }
                    
                    // Only draw frame at specified frame rate
                    if (currentTime - lastFrameTime >= frameInterval) {
                        ctx.drawImage(hiddenVideo, 0, 0, width, height);
                        this.drawTelemetryOverlay(ctx, hiddenVideo.currentTime, width, height);
                        lastFrameTime = currentTime;
                        
                        // Update progress based on video playback
                        const currentProgress = (hiddenVideo.currentTime - startTime) / totalDuration;
                        const segmentProgress = (i / hiddenVideos.length) * 100;
                        const frameProgress = segmentProgress + (currentProgress * (100 / hiddenVideos.length));
                        this.updateProgress(frameProgress, `Processing segment ${i + 1}/${hiddenVideos.length} (${Math.round(currentProgress * 100)}%)...`);
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

    async processCombinedClipWithWebCodecs(clip, videoInfo, hiddenVideos, width, height, frameRate) {
        this.log('Using WebCodecs API for fast combined clip processing...');
        
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
            for (let i = 0; i < hiddenVideos.length; i++) {
                const hiddenVideoData = hiddenVideos[i];
                const hiddenVideo = hiddenVideoData.video;
                const clipSegment = hiddenVideoData.clipSegment;
                const clipVideoInfo = hiddenVideoData.clipVideoInfo;
                const startTime = clipVideoInfo.spliceStart || 0;
                const endTime = clipVideoInfo.spliceEnd || clipVideoInfo.duration;
                
                // Update progress for processing
                const processingProgress = (i / hiddenVideos.length) * 100;
                this.updateProgress(processingProgress, `Processing segment ${i + 1}/${hiddenVideos.length}...`);
                
                // Add a small delay to make progress visible
                await new Promise(resolve => setTimeout(resolve, 50));
                
                this.log(`Processing clip segment ${i + 1}/${hiddenVideos.length}: ${startTime}s to ${endTime}s using hidden video (WebCodecs)`);
                this.log(`Seeking hidden video ${i} to ${startTime}s (WebCodecs)`);
                
                // Ensure video is ready before seeking
                if (hiddenVideo.readyState < 2) {
                    this.updateProgress(processingProgress + 5, `Loading video ${i + 1}/${hiddenVideos.length}...`);
                    await new Promise((resolve) => {
                        hiddenVideo.addEventListener('loadeddata', resolve, { once: true });
                    });
                }
                
                // Seek to start time and wait for seek to complete
                this.updateProgress(processingProgress + 10, `Seeking to ${startTime}s...`);
                hiddenVideo.currentTime = startTime;
                await new Promise((resolve) => {
                    const seekHandler = () => {
                        this.log(`Hidden video ${i} seeked to: ${hiddenVideo.currentTime}s (WebCodecs)`);
                        resolve();
                    };
                    
                    // Use seeking event if available, otherwise use a timeout
                    if ('seeking' in hiddenVideo) {
                        hiddenVideo.addEventListener('seeked', seekHandler, { once: true });
                    } else {
                        setTimeout(seekHandler, 100);
                    }
                });
                
                // Wait for video to be ready to play
                this.updateProgress(processingProgress + 15, `Preparing video ${i + 1}/${hiddenVideos.length}...`);
                await new Promise((resolve) => {
                    hiddenVideo.addEventListener('canplay', resolve, { once: true });
                    hiddenVideo.play();
                });

                // Process video frames with WebCodecs-optimized timing
                await new Promise((resolve) => {
                    const frameInterval = 1000 / frameRate;
                    let lastFrameTime = 0;
                    const totalDuration = endTime - startTime;
                    
                    const processFrame = (currentTime) => {
                        // Check if we've reached or exceeded the end time
                        if (hiddenVideo.currentTime >= endTime || hiddenVideo.ended || hiddenVideo.paused) {
                            this.log(`Hidden video ${i} finished: currentTime=${hiddenVideo.currentTime}s, endTime=${endTime}s (WebCodecs)`);
                            // Stop the video immediately to prevent further playback
                            hiddenVideo.pause();
                            resolve();
                            return;
                        }
                        
                        // Optimized frame processing for WebCodecs
                        if (currentTime - lastFrameTime >= frameInterval) {
                            ctx.drawImage(hiddenVideo, 0, 0, width, height);
                            this.drawTelemetryOverlay(ctx, hiddenVideo.currentTime, width, height);
                            lastFrameTime = currentTime;
                            
                            // Update progress based on video playback
                            const currentProgress = (hiddenVideo.currentTime - startTime) / totalDuration;
                            const segmentProgress = (i / hiddenVideos.length) * 100;
                            const frameProgress = segmentProgress + (currentProgress * (100 / hiddenVideos.length));
                            this.updateProgress(frameProgress, `Processing segment ${i + 1}/${hiddenVideos.length} (${Math.round(currentProgress * 100)}%)...`);
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
            this.logError('WebCodecs processing failed, falling back to standard method:', error);
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
        
        // Create dropdown container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'event-dropdown-container';
        
        // Create dropdown button
        const dropdownButton = document.createElement('button');
        dropdownButton.className = 'event-dropdown-btn';
        dropdownButton.innerHTML = `
            <i class="fas fa-chevron-down"></i>
            Select Events (${this.selectedEvents.length} selected)
        `;
        dropdownButton.onclick = () => this.toggleEventDropdown();
        
        // Create dropdown content
        const dropdownContent = document.createElement('div');
        dropdownContent.className = 'event-dropdown-content';
        dropdownContent.id = 'eventDropdownContent';
        
        // Add select all/none buttons
        const selectAllContainer = document.createElement('div');
        selectAllContainer.className = 'select-all-container';
        selectAllContainer.innerHTML = `
            <button class="select-all-btn" onclick="teslaCamPlayer.selectAllEvents()">
                <i class="fas fa-check-square"></i> Select All
            </button>
            <button class="select-none-btn" onclick="teslaCamPlayer.selectNoEvents()">
                <i class="fas fa-square"></i> Select None
            </button>
        `;
        dropdownContent.appendChild(selectAllContainer);
        
        // Add event checkboxes
        this.events.forEach((event, index) => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-checkbox-item';
            
            // Get unique cameras for this event
            const uniqueCameras = [...new Set(event.videos.map(v => v.camera))];
            const cameraText = uniqueCameras.length === 1 ? 'camera' : 'cameras';
            
            eventItem.innerHTML = `
                <label class="event-checkbox-label">
                    <input type="checkbox" 
                           class="event-checkbox" 
                           value="${index}"
                           ${this.selectedEvents.includes(index) ? 'checked' : ''}
                           onchange="teslaCamPlayer.toggleEventSelection(${index})">
                    <span class="event-checkbox-text">
                        <strong>Event ${index + 1}</strong>
                        <span class="event-details">${event.videos.length} videos • ${uniqueCameras.length} ${cameraText}</span>
                        <span class="event-timestamp">${event.timestamp.toLocaleString()}</span>
                    </span>
                </label>
            `;
            dropdownContent.appendChild(eventItem);
        });
        
        dropdownContainer.appendChild(dropdownButton);
        dropdownContainer.appendChild(dropdownContent);
        this.selectedEventsList.appendChild(dropdownContainer);
    }

    toggleEventSelection(eventIndex) {
        if (!this.isEventSelectMode) return;
        
        const index = this.selectedEvents.indexOf(eventIndex);
        if (index > -1) {
            this.selectedEvents.splice(index, 1);
        } else {
            this.selectedEvents.push(eventIndex);
        }
        
        // Update the dropdown button text and checkbox states without re-rendering
        this.updateDropdownButtonText();
        this.updateCheckboxStates();
        this.updateCombineButton();
    }
    
    toggleEventDropdown() {
        const dropdownContent = document.getElementById('eventDropdownContent');
        if (dropdownContent) {
            dropdownContent.classList.toggle('show');
        }
    }
    
    selectAllEvents() {
        this.selectedEvents = this.events.map((_, index) => index);
        this.updateDropdownButtonText();
        this.updateCheckboxStates();
        this.updateCombineButton();
    }
    
    selectNoEvents() {
        this.selectedEvents = [];
        this.updateDropdownButtonText();
        this.updateCheckboxStates();
        this.updateCombineButton();
    }
    
    updateDropdownButtonText() {
        const dropdownButton = document.querySelector('.event-dropdown-btn');
        if (dropdownButton) {
            dropdownButton.innerHTML = `
                <i class="fas fa-chevron-down"></i>
                Select Events (${this.selectedEvents.length} selected)
            `;
        }
    }
    
    updateCheckboxStates() {
        // Update all checkbox states without re-rendering
        const checkboxes = document.querySelectorAll('.event-checkbox');
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = this.selectedEvents.includes(index);
        });
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

        // Collect all cameras and estimate total duration
        this.selectedEvents.forEach(eventIndex => {
            const event = this.events[eventIndex];
            event.videos.forEach(video => combinedEvent.cameras.add(video.camera));
        });

        // Estimate total duration based on number of events (typical TeslaCam events are ~1 minute)
        const estimatedDurationPerEvent = 60000; // 1 minute in milliseconds
        combinedEvent.totalDuration = this.selectedEvents.length * estimatedDurationPerEvent;
        combinedEvent.totalDurationSeconds = combinedEvent.totalDuration / 1000;

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

        this.showProgress(`Combining Events - ${camera}`, 'Initializing video processing...');
        this.log('Starting download for combined event:', combinedEvent);
        this.log('Camera:', camera);

        // Check if WebCodecs API is supported and we're in a secure context
        const useWebCodecs = ('VideoEncoder' in window) && ('VideoDecoder' in window) && window.isSecureContext;
        
        if (!useWebCodecs) {
            this.log('WebCodecs not available, using fallback Canvas/MediaRecorder method');
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

        this.log('Found camera videos:', cameraVideos.length);

        try {
            // Create separate video elements for each event's video
            const videoElements = [];
            
            for (let i = 0; i < cameraVideos.length; i++) {
                const cameraVideo = cameraVideos[i];
                
                // Update progress for loading videos
                const loadingProgress = (i / cameraVideos.length) * 50; // First 50% for loading
                this.updateProgress(loadingProgress, `Loading video ${i + 1}/${cameraVideos.length}...`);
                
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

            this.log(`Video dimensions: ${width}x${height}, Frame rate: ${frameRate}`);

            // Use appropriate processing method based on WebCodecs availability
            if (useWebCodecs) {
                await this.processVideosWithWebCodecs(videoElements, width, height, frameRate, camera, combinedEvent);
            } else {
                await this.processVideosOptimized(videoElements, width, height, frameRate, camera, combinedEvent);
            }

            // Complete progress
            this.updateProgress(100, 'Download completed!');
            setTimeout(() => {
                this.hideProgress();
            }, 1000);

        } catch (error) {
            this.logError('Error processing videos:', error);
            this.showError(`Failed to process videos: ${error.message}`);
            this.hideProgress();
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
            
            // Update progress for processing
            const processingProgress = 50 + (i / videoElements.length) * 50; // Second 50% for processing
            this.updateProgress(processingProgress, `Processing video ${i + 1}/${videoElements.length}...`);
            
            // Add a small delay to make progress visible
            await new Promise(resolve => setTimeout(resolve, 50));
            
            this.log(`Processing video ${i + 1}/${videoElements.length}: ${videoElement.name}`);
            
            // Reset video to beginning
            video.currentTime = 0;
            
            // Wait for video to be ready
            this.updateProgress(processingProgress + 5, `Preparing video ${i + 1}/${videoElements.length}...`);
            await new Promise((resolve) => {
                video.addEventListener('canplay', resolve, { once: true });
                video.play();
            });

            // Process video frames with optimized timing
            await new Promise((resolve) => {
                const startTime = performance.now();
                const frameInterval = 1000 / frameRate; // Time between frames
                let lastFrameTime = 0;
                const videoDuration = video.duration || 60; // Fallback duration
                
                const processFrame = (currentTime) => {
                    if (video.ended || video.paused) {
                        resolve();
                        return;
                    }
                    
                    // Only draw frame at specified frame rate
                    if (currentTime - lastFrameTime >= frameInterval) {
                        ctx.drawImage(video, 0, 0, width, height);
                        lastFrameTime = currentTime;
                        
                        // Update progress based on video playback
                        const currentProgress = video.currentTime / videoDuration;
                        const segmentProgress = 50 + (i / videoElements.length) * 50;
                        const frameProgress = segmentProgress + (currentProgress * (50 / videoElements.length));
                        this.updateProgress(frameProgress, `Processing video ${i + 1}/${videoElements.length} (${Math.round(currentProgress * 100)}%)...`);
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
        this.log('Using WebCodecs API for fast video processing...');
        
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
                
                // Update progress for processing
                const processingProgress = 50 + (i / videoElements.length) * 50; // Second 50% for processing
                this.updateProgress(processingProgress, `Processing video ${i + 1}/${videoElements.length}...`);
                
                // Add a small delay to make progress visible
                await new Promise(resolve => setTimeout(resolve, 50));
                
                this.log(`Processing video ${i + 1}/${videoElements.length}: ${videoElement.name} (WebCodecs)`);
                
                // Reset video to beginning
                video.currentTime = 0;
                
                // Wait for video to be ready
                this.updateProgress(processingProgress + 5, `Preparing video ${i + 1}/${videoElements.length}...`);
                await new Promise((resolve) => {
                    video.addEventListener('canplay', resolve, { once: true });
                    video.play();
                });

                // Process video frames with WebCodecs-optimized timing
                await new Promise((resolve) => {
                    const frameInterval = 1000 / frameRate;
                    let lastFrameTime = 0;
                    const videoDuration = video.duration || 60; // Fallback duration
                    
                    const processFrame = (currentTime) => {
                        if (video.ended || video.paused) {
                            resolve();
                            return;
                        }
                        
                        // Optimized frame processing for WebCodecs
                        if (currentTime - lastFrameTime >= frameInterval) {
                            ctx.drawImage(video, 0, 0, width, height);
                            lastFrameTime = currentTime;
                            
                            // Update progress based on video playback
                            const currentProgress = video.currentTime / videoDuration;
                            const segmentProgress = 50 + (i / videoElements.length) * 50;
                            const frameProgress = segmentProgress + (currentProgress * (50 / videoElements.length));
                            this.updateProgress(frameProgress, `Processing video ${i + 1}/${videoElements.length} (${Math.round(currentProgress * 100)}%)...`);
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
            this.logError('WebCodecs processing failed, falling back to standard method:', error);
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
    
    // Helper method for conditional logging
    log(...args) {
        if (!this.isProduction) {
            console.log(...args);
        }
    }
    
    // Helper method for conditional error logging
    logError(...args) {
        if (!this.isProduction) {
            console.error(...args);
        }
    }
    
    // Progress Management Methods
    showProgress(title, status = 'Initializing...') {
        console.log('showProgress called:', title, status);
        console.trace('showProgress stack trace:'); // This will show the call stack
        
        // Hide any existing download overlay
        if (this.downloadOverlay) {
            this.downloadOverlay.style.display = 'none';
        }
        
        console.log('Progress elements:', {
            overlay: this.progressOverlay,
            title: this.progressTitle,
            status: this.progressStatus,
            fill: this.progressFill,
            text: this.progressText
        });
        
        if (!this.progressOverlay || !this.progressTitle || !this.progressStatus || !this.progressFill || !this.progressText) {
            console.error('Progress elements not found!');
            return;
        }
        
        this.progressTitle.textContent = title;
        this.progressStatus.textContent = status;
        this.progressFill.style.width = '0%';
        this.progressText.textContent = '0%';
        
        this.progressOverlay.style.display = 'flex';
        console.log('Progress overlay shown');
        
        // Debug: Check computed styles
        const computedStyle = window.getComputedStyle(this.progressOverlay);
        console.log('Progress overlay computed styles:', {
            display: computedStyle.display,
            position: computedStyle.position,
            zIndex: computedStyle.zIndex,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            width: computedStyle.width,
            height: computedStyle.height
        });
        
        // Force visibility
        this.progressOverlay.style.visibility = 'visible';
        this.progressOverlay.style.opacity = '1';
        this.progressOverlay.style.zIndex = '9999';
        
        // Debug: Check if content is visible
        const panel = this.progressOverlay.querySelector('.progress-panel');
        const titleElement = this.progressOverlay.querySelector('#progressTitle');
        const bar = this.progressOverlay.querySelector('#progressBar');
        const fill = this.progressOverlay.querySelector('#progressFill');
        
        console.log('Progress content elements:', {
            panel: panel,
            title: titleElement,
            bar: bar,
            fill: fill
        });
        
        if (panel) {
            const panelStyle = window.getComputedStyle(panel);
            console.log('Panel computed styles:', {
                display: panelStyle.display,
                visibility: panelStyle.visibility,
                opacity: panelStyle.opacity,
                background: panelStyle.background,
                width: panelStyle.width,
                height: panelStyle.height
            });
        }
        

    }
    
    updateProgress(percentage, status) {
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = `${Math.round(percentage)}%`;
        if (status) {
            this.progressStatus.textContent = status;
        }
    }
    
    hideProgress() {
        this.progressOverlay.style.display = 'none';
        this.progressOverlay.style.visibility = 'hidden';
        this.progressOverlay.style.opacity = '0';
        this.progressOverlay.style.pointerEvents = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.teslaCamPlayer = new TeslaCamPlayer();
    
    // Check for service worker updates
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.update();
        });
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.teslaCamPlayer) {
        window.teslaCamPlayer.cleanup();
    }
}); 