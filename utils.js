export async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}

export function mergeStreams(channelsData, streamsData) {
  const streamsMap = {};

  streamsData.forEach(stream => {
    if (!streamsMap[stream.channel]) {
      streamsMap[stream.channel] = [];
    }
    streamsMap[stream.channel].push(stream);
  });

  channelsData.forEach(channel => {
    if (streamsMap[channel.id]) {
      channel.streams = streamsMap[channel.id];
    }
  });

  return channelsData;
}

export function getAvailableChannels(channelsData, streamsData) {
  const channelsWithStreams = mergeStreams(channelsData, streamsData);

  return channelsWithStreams.filter(channel => channel.streams && channel.streams.length > 0)
    .map(channel => {
      return {
        id: channel.id,
        name: channel.name,
        logo: channel.logo,
        category: channel.categories[0] || 'other',
        country: channel.country,
        url: channel.streams[0].url
      };
    });
}

export function groupByCategory(channels, categoriesData) {
  const categoriesMap = {};
  categoriesData.forEach(category => {
    categoriesMap[category.id] = { name: category.name, channels: [] };
  });

  channels.forEach(channel => {
    const category = channel.category;
    if (categoriesMap[category]) {
      categoriesMap[category].channels.push(channel);
    } else {
      if (!categoriesMap['other']) {
        categoriesMap['other'] = { name: 'Other', channels: [] };
      }
      categoriesMap['other'].channels.push(channel);
    }
  });

  return categoriesMap;
}

export async function fetchGuide(channel) {
  const guidesData = await fetchData('https://iptv-org.github.io/api/guides.json');
  const guideInfo = guidesData.find(guide => guide.channel === channel.id);

  if (!guideInfo) {
    return null;
  }

  // Fetch EPG data using guideInfo (This is a placeholder, actual EPG data fetching would require accessing the guide's API)
  // For demonstration purposes, returning mock data

  const mockEPG = [
    { startTime: '08:00', endTime: '09:00', title: 'Morning News' },
    { startTime: '09:00', endTime: '10:00', title: 'Daily Talk Show' },
    { startTime: '10:00', endTime: '11:00', title: 'Documentary' },
    { startTime: '11:00', endTime: '12:00', title: 'Cooking Show' }
  ];

  return mockEPG;
}