export async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export function groupByCategory(channels, categoriesData) {
  const categoriesMap = new Map(
    categoriesData.map(category => [
      category.id,
      { name: category.name, channels: [] }
    ])
  );

  channels.forEach(channel => {
    const category = channel.category;
    if (categoriesMap.has(category)) {
      categoriesMap.get(category).channels.push(channel);
    } else {
      if (!categoriesMap.has('other')) {
        categoriesMap.set('other', { name: 'Other', channels: [] });
      }
      categoriesMap.get('other').channels.push(channel);
    }
  });

  return Object.fromEntries(categoriesMap);
}

export function getAvailableChannels(channels, streams) {
  const streamMap = new Map(
    streams.map(stream => [stream.channel, stream])
  );

  return channels
    .filter(channel => streamMap.has(channel.id))
    .map(channel => ({
      id: channel.id,
      name: channel.name,
      logo: channel.logo,
      category: channel.categories[0] || 'other',
      country: channel.country,
      url: streamMap.get(channel.id).url
    }));
}