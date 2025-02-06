// Player Management
class VideoPlayer {
    constructor() {
      this.video = document.getElementById('videoPlayer');
      this.playPauseBtn = document.getElementById('playPause');
      this.volumeSlider = document.getElementById('volume');
      this.fullscreenBtn = document.getElementById('fullscreen');
      this.setupControls();
    }
  
    setupControls() {
      this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
      this.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
      this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
    }
  
    togglePlayPause() {
      if (this.video.paused) {
        this.video.play();
      } else {
        this.video.pause();
      }
    }
  
    setVolume(value) {
      this.video.volume = value / 100;
    }
  
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        this.video.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  
    loadStream(url) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(this.video);
      } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
        this.video.src = url;
      }
    }
  }
  
  // Platform and Channel Management
  class ContentManager {
    constructor(videoPlayer) {
      this.videoPlayer = videoPlayer;
      this.platforms = [];
      this.currentPlatform = null;
      this.setupSearch();
      this.loadPlatforms();
    }
  
    setupSearch() {
      const searchBar = document.getElementById('searchBar');
      searchBar.addEventListener('input', (e) => this.filterPlatforms(e.target.value));
    }
  
    filterPlatforms(query) {
      const platformList = document.getElementById('platformList');
      platformList.innerHTML = '';
      
      const filtered = this.platforms.filter(platform => 
        platform.name.toLowerCase().includes(query.toLowerCase())
      );
  
      filtered.forEach(platform => this.renderPlatform(platform));
    }
  
    async loadPlatforms() {
      try {
        // Simulated API call - replace with actual endpoint
        const response = await fetch('platforms.json');
        this.platforms = await response.json();
        this.renderPlatforms();
      } catch (error) {
        console.error('Error loading platforms:', error);
      }
    }
  
    renderPlatforms() {
      const platformList = document.getElementById('platformList');
      platformList.innerHTML = '';
      this.platforms.forEach(platform => this.renderPlatform(platform));
    }
  
    renderPlatform(platform) {
      const li = document.createElement('li');
      li.className = 'platform';
      li.innerHTML = `
        <i class="fas fa-broadcast-tower"></i>
        ${platform.name}
      `;
      li.addEventListener('click', () => this.selectPlatform(platform));
      document.getElementById('platformList').appendChild(li);
    }
  
    selectPlatform(platform) {
      this.currentPlatform = platform;
      this.renderChannels(platform.channels);
    }
  
    renderChannels(channels) {
      const channelList = document.getElementById('channelList');
      channelList.innerHTML = '';
      
      channels.forEach(channel => {
        const li = document.createElement('li');
        li.className = 'channel';
        li.innerHTML = `
          <i class="fas fa-tv"></i>
          ${channel.name}
        `;
        li.addEventListener('click', () => this.selectChannel(channel));
        channelList.appendChild(li);
      });
    }
  
    selectChannel(channel) {
      document.getElementById('channelInfo').textContent = channel.name;
      this.videoPlayer.loadStream(channel.streamUrl);
    }
  }
  
  // Initialize application
  document.addEventListener('DOMContentLoaded', () => {
    const player = new VideoPlayer();
    const manager = new ContentManager(player);
  });