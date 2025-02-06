import APIService from './services/APIService.js';
import { ChannelService } from './services/ChannelService.js';
import { PlayerService } from './services/PlayerService.js';
import { UIManager } from './services/UIManager.js';

class App {
  constructor() {
    // Add error handling for ResizeObserver
    const resizeObserver = new ResizeObserver(entries => {
      // Prevent the loop limit error by debouncing
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }
      });
    });

    // Observe the main content area
    const main = document.querySelector('main');
    if (main) {
      resizeObserver.observe(main);
    }

    this.initializeApp();
  }

  async initializeApp() {
    try {
      // Initialize UI first
      this.ui = new UIManager({
        onChannelSelect: (channelId) => this.handleChannelSelect(channelId),
        onSearch: (query) => this.handleSearch(query),
        onCategorySelect: (categoryId) => this.handleCategorySelect(categoryId),
        getCountry: (code) => this.channelService?.countries.get(code),
        getLanguage: (code) => this.channelService?.languages.get(code)
      });

      this.ui.showLoading();

      // Fetch initial data
      const data = await APIService.getAllData();
      if (!data) throw new Error('Failed to fetch data');

      // Initialize services
      this.channelService = new ChannelService(data);
      
      // Initialize player
      const videoElement = document.getElementById('videoPlayer');
      const shakaElement = document.getElementById('shakaPlayer');
      if (!videoElement || !shakaElement) throw new Error('Video elements not found');
      
      this.player = new PlayerService(videoElement, shakaElement);

      // Render initial UI
      const categories = this.channelService.getAllCategories();
      const channels = this.channelService.getAllChannels();
      
      console.log('Categories:', categories);
      console.log('Channels:', channels);

      this.ui.renderCategories(categories);
      this.ui.renderChannels(channels);

      this.initializeControls();
      this.ui.hideLoading();

    } catch (error) {
      console.error('Failed to initialize application:', error);
      this.ui.hideLoading();
      this.ui.showError('Failed to initialize application. Please try again later.');
    }
  }

  initializeControls() {
    const previousBtn = document.getElementById('previousChannel');
    const nextBtn = document.getElementById('nextChannel');
    const lastBtn = document.getElementById('lastChannel');

    if (previousBtn) {
      previousBtn.addEventListener('click', () => this.player.playLastChannel());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const channels = this.channelService.getAllChannels();
        const currentIndex = channels.findIndex(c => c.id === this.player.currentChannel?.id);
        if (currentIndex > -1 && currentIndex < channels.length - 1) {
          this.handleChannelSelect(channels[currentIndex + 1].id);
        }
      });
    }

    if (lastBtn) {
      lastBtn.addEventListener('click', () => this.player.playLastChannel());
    }
  }

  async handleChannelSelect(channelId) {
    try {
      const channel = this.channelService.getChannelById(channelId);
      if (!channel) throw new Error('Channel not found');
      
      const success = await this.player.playChannel(channel);
      if (success) {
        this.ui.updateNowPlaying(channel);
        const guide = await APIService.getGuide(channelId);
        this.ui.updateProgramGuide(guide);
      } else {
        this.ui.showError('Failed to play channel');
      }
    } catch (error) {
      console.error('Error playing channel:', error);
      this.ui.showError('Failed to play channel');
    }
  }

  handleSearch(query) {
    const results = this.channelService.searchChannels(query);
    this.ui.renderChannels(results);
  }

  handleCategorySelect(categoryId) {
    const channels = this.channelService.getChannelsByCategory(categoryId);
    this.ui.renderChannels(channels);
  }
}

// Initialize app when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  // Prevent ResizeObserver errors from showing in console
  const originalError = console.error;
  console.error = (...args) => {
    if (args[0]?.includes?.('ResizeObserver')) return;
    originalError.apply(console, args);
  };
  
  window.app = new App();
});