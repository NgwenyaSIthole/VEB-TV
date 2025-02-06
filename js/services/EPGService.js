class EPGService {
  constructor() {
    this.baseUrl = 'http://api.tvmaze.com';
    this.cache = new Map();
  }

  async getSchedule(channelId) {
    if (this.cache.has(channelId)) {
      const { timestamp, data } = this.cache.get(channelId);
      if (Date.now() - timestamp < 15 * 60 * 1000) { // 15 minutes cache
        return data;
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/schedule?country=US`);
      const data = await response.json();
      
      // Process and format the schedule data
      const schedule = data.map(show => ({
        startTime: new Date(show.airstamp).toLocaleTimeString(),
        endTime: new Date(new Date(show.airstamp).getTime() + show.runtime * 60000).toLocaleTimeString(),
        title: show.name,
        description: show.summary,
        episode: show.episode?.name || ''
      }));

      this.cache.set(channelId, {
        timestamp: Date.now(),
        data: schedule
      });

      return schedule;
    } catch (error) {
      console.error('Failed to fetch EPG data:', error);
      return [];
    }
  }
}

export default new EPGService();