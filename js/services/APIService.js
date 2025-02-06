class APIService {
  static BASE_URL = 'https://iptv-org.github.io/api';

  static async getAllData() {
    try {
      console.log('Fetching data from API...');
      
      const responses = await Promise.all([
        fetch(`${this.BASE_URL}/channels.json`),
        fetch(`${this.BASE_URL}/streams.json`),
        fetch(`${this.BASE_URL}/categories.json`),
        fetch(`${this.BASE_URL}/languages.json`),
        fetch(`${this.BASE_URL}/countries.json`)
      ]);

      const [channels, streams, categories, languages, countries] = await Promise.all(
        responses.map(r => r.json())
      );

      console.log('Data fetched successfully');

      // Filter active channels with valid streams
      const activeChannels = channels
        .filter(channel => !channel.closed)
        .map(channel => {
          const channelStreams = streams.filter(s => s.channel === channel.id);
          return {
            id: channel.id,
            name: channel.name,
            logo: channel.logo,
            country: channel.country,
            languages: channel.languages || [],
            categories: channel.categories || [],
            streams: channelStreams
          };
        })
        .filter(channel => channel.streams && channel.streams.length > 0);

      console.log(`Found ${activeChannels.length} active channels`);

      return {
        channels: activeChannels,
        categories,
        languages,
        countries
      };
    } catch (error) {
      console.error('Failed to fetch data:', error);
      return null;
    }
  }

  static async getGuide(channelId) {
    try {
      const response = await fetch(`${this.BASE_URL}/guides/${channelId}.json`);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch guide:', error);
      return [];
    }
  }
}

export default APIService;