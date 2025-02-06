import APIService from './APIService.js';

export class ChannelService {
  constructor(data) {
    this.channels = [];
    this.categories = new Map();
    this.languages = new Map();
    this.countries = new Map();
    
    if (!data) {
      throw new Error('Invalid data provided to ChannelService');
    }
    
    this.initialize(data);
  }

  initialize(data) {
    console.log('Initializing ChannelService with data:', data);

    // Initialize channels
    if (Array.isArray(data.channels)) {
      this.channels = data.channels.map(channel => ({
        ...channel,
        url: channel.streams[0]?.url
      }));
    }

    // Initialize categories
    if (Array.isArray(data.categories)) {
      data.categories.forEach(cat => {
        this.categories.set(cat.id, {
          id: cat.id,
          name: cat.name,
          channels: this.channels.filter(ch => ch.categories?.includes(cat.id))
        });
      });
    }

    // Initialize languages and countries
    if (Array.isArray(data.languages)) {
      data.languages.forEach(lang => this.languages.set(lang.code, lang));
    }

    if (Array.isArray(data.countries)) {
      data.countries.forEach(country => this.countries.set(country.code, country));
    }

    console.log(`Initialized with ${this.channels.length} channels`);
  }

  getAllChannels() {
    return this.channels;
  }

  getAllCategories() {
    return Array.from(this.categories.values());
  }

  getChannelById(id) {
    return this.channels.find(ch => ch.id === id);
  }

  getChannelsByCategory(categoryId) {
    return categoryId === 'all' 
      ? this.channels 
      : this.categories.get(categoryId)?.channels || [];
  }

  searchChannels(query) {
    if (!query) return this.channels;
    query = query.toLowerCase();
    return this.channels.filter(channel => 
      channel.name.toLowerCase().includes(query)
    );
  }
}