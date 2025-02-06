import { PLAYER_CONFIG } from '../config.js';

export class PlayerService {
  constructor(videoElement, shakaElement) {
    this.video = videoElement;
    this.shakaElement = shakaElement;
    this.shaka = null;
    this.hls = null;
    this.currentChannel = null;
    this.channelHistory = [];
    this.initPlayers();
  }

  async initPlayers() {
    shaka.polyfill.installAll();
    if (shaka.Player.isBrowserSupported()) {
      this.shaka = new shaka.Player(this.shakaElement);
      this.setupShakaErrorHandling();
    }
    
    if (Hls.isSupported()) {
      this.hls = new Hls(PLAYER_CONFIG.HLS_CONFIG);
      this.hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch(data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              this.recoverNetworkError();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              this.recoverMediaError();
              break;
            default:
              this.destroyPlayer();
              break;
          }
        }
      });
    }
  }

  async playChannel(channel) {
    if (this.currentChannel) {
      this.channelHistory.push(this.currentChannel);
    }
    this.currentChannel = channel;
    
    try {
      if (channel.url.includes('.mpd')) {
        await this.playShakaStream(channel.url);
      } else {
        await this.playHLSStream(channel.url);
      }
      return true;
    } catch (error) {
      console.error('Playback error:', error);
      return false;
    }
  }

  async playLastChannel() {
    const lastChannel = this.channelHistory.pop();
    if (lastChannel) {
      await this.playChannel(lastChannel);
    }
  }

  togglePlayPause() {
    if (this.video.paused) {
      this.video.play();
    } else {
      this.video.pause();
    }
  }

  async playShakaStream(url) {
    if (!this.shaka) return;
    try {
      await this.shaka.load(url);
      this.video.style.display = 'none';
      this.shakaElement.style.display = 'block';
    } catch (error) {
      console.error('Shaka error:', error);
      throw error;
    }
  }

  async playHLSStream(url) {
    if (Hls.isSupported()) {
      this.hls.loadSource(url);
      this.hls.attachMedia(this.video);
      this.video.style.display = 'block';
      this.shakaElement.style.display = 'none';
      await this.video.play();
    } else if (this.video.canPlayType('application/vnd.apple.mpegurl')) {
      this.video.src = url;
      await this.video.play();
    }
  }

  setupShakaErrorHandling() {
    this.shaka.addEventListener('error', (event) => {
      console.error('Shaka error:', event);
    });
  }

  async recoverNetworkError() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (this.hls) {
      this.hls.startLoad();
    }
  }

  recoverMediaError() {
    if (this.hls) {
      this.hls.recoverMediaError();
    }
  }

  destroyPlayer() {
    if (this.hls) {
      this.hls.destroy();
      this.hls = null;
    }
    if (this.shaka) {
      this.shaka.destroy();
      this.shaka = null;
    }
    this.video.src = '';
    this.currentChannel = null;
  }

  setVolume(value) {
    this.video.volume = Math.max(0, Math.min(1, value));
  }

  async toggleFullscreen() {
    try {
      if (!document.fullscreenElement) {
        await this.video.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }
}