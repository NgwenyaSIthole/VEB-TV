export class UIManager {
  constructor(callbacks = {}) {
    this.callbacks = callbacks;
    this.searchBar = document.getElementById('searchBar');
    this.platformList = document.getElementById('platformList');
    this.channelList = document.getElementById('channelList');
    
    if (this.searchBar) {
      this.searchBar.addEventListener('input', (e) => {
        this.callbacks.onSearch?.(e.target.value);
      });
    }

    this.renderCategories = (categories) => {
      const categoryList = document.createElement('ul');
      categoryList.id = 'categoryList';
      categoryList.className = 'category-list';

      categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'category-item';
        li.innerHTML = `
          <i class="fas fa-folder"></i>
          <span class="category-name">${category.name}</span>
          <span class="channel-count">${category.channels.length}</span>
        `;
        
        li.addEventListener('click', () => {
          this.callbacks.onCategorySelect?.(category.id);
          // Highlight selected category
          document.querySelectorAll('.category-item').forEach(el => el.classList.remove('selected'));
          li.classList.add('selected');
        });
        
        categoryList.appendChild(li);
      });

      const filtersDiv = document.querySelector('.filters');
      if (filtersDiv) {
        filtersDiv.appendChild(categoryList);
      }
    }

    this.showLoading = () => {
      const loading = document.createElement('div');
      loading.className = 'loading';
      loading.id = 'loadingIndicator';
      document.body.appendChild(loading);
    }

    this.hideLoading = () => {
      const loading = document.getElementById('loadingIndicator');
      if (loading) {
        loading.remove();
      }
    }

    this.showError = (message) => {
      const error = document.createElement('div');
      error.className = 'error-message';
      error.textContent = message;
      document.body.appendChild(error);
      setTimeout(() => error.remove(), 5000);
    }

    this.renderChannels = (channels) => {
      if (!this.channelList) return;
      
      this.channelList.innerHTML = '';
      channels.forEach(channel => {
        const channelElement = this.createChannelElement(channel);
        this.channelList.appendChild(channelElement);
      });
    }

    this.updateNowPlaying = (channelMetadata) => {
      const channelInfo = document.getElementById('channelInfo');
      if (channelInfo) {
        channelInfo.innerHTML = `
          <h3>Now Playing</h3>
          <div class="channel-meta">
            <img src="${channelMetadata.logo}" alt="${channelMetadata.name}" class="channel-logo">
            <div>
              <div class="channel-name">${channelMetadata.name}</div>
              <div class="channel-details">
                ${channelMetadata.country} • ${channelMetadata.languages.join(', ')}
              </div>
            </div>
          </div>
        `;
      }
    }

    this.updateProgramGuide = (programs) => {
      const scheduleList = document.getElementById('schedule-list');
      if (!scheduleList) return;

      scheduleList.innerHTML = '';
      programs.forEach(program => {
        const li = document.createElement('li');
        li.className = 'program-item';
        li.innerHTML = `
          <span class="program-time">${program.startTime} - ${program.endTime}</span>
          <span class="program-title">${program.title}</span>
        `;
        scheduleList.appendChild(li);
      });
    }

    this.createChannelElement = (channel) => {
      const li = document.createElement('li');
      li.className = 'channel';
      const country = this.callbacks.getCountry?.(channel.country);
      const languages = channel.languages
        .map(code => this.callbacks.getLanguage?.(code)?.name)
        .filter(Boolean)
        .join(', ');

      li.innerHTML = `
        <div class="channel-logo">
          <img src="${channel.logo || 'https://via.placeholder.com/40'}" 
               alt="${channel.name}" 
               onerror="this.src='https://via.placeholder.com/40'">
        </div>
        <div class="channel-info">
          <span class="channel-name">${channel.name}</span>
          <span class="channel-meta">
            ${country?.flag || ''} ${languages}
          </span>
        </div>
      `;
      
      li.addEventListener('click', () => {
        this.callbacks.onChannelSelect?.(channel.id);
      });
      
      return li;
    }

    this.renderPlatform = (platform) => {
      const li = document.createElement('li');
      li.className = 'platform';
      li.innerHTML = `
        <i class="fas fa-broadcast-tower"></i>
        <span class="platform-name">${platform.name}</span>
        <span class="channel-count">${platform.channels?.length || 0}</span>
      `;
      
      li.addEventListener('click', () => {
        this.callbacks.onPlatformSelect?.(platform);
      });
      
      return li;
    }

    this.renderPlatforms = (platforms) => {
      if (!this.platformList) return;
      
      this.platformList.innerHTML = '';
      platforms.forEach(platform => {
        const platformElement = this.renderPlatform(platform);
        this.platformList.appendChild(platformElement);
      });
    }
  }
}