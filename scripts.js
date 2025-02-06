import { fetchData, groupByCategory, getAvailableChannels, fetchGuide } from './utils.js';

const API_BASE_URL = 'https://iptv-org.github.io/api';

const videoPlayer = document.getElementById('videoPlayer');
const channelInfo = document.getElementById('channelInfo');
const platformsList = document.getElementById('platforms-list');
const channelsList = document.getElementById('channels-list');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const scheduleList = document.getElementById('schedule-list');

let allChannels = [];

async function init() {
  try {
    const [channelsData, streamsData, categoriesData] = await Promise.all([
      fetchData(`${API_BASE_URL}/channels.json`),
      fetchData(`${API_BASE_URL}/streams.json`),
      fetchData(`${API_BASE_URL}/categories.json`),
    ]);

    allChannels = getAvailableChannels(channelsData, streamsData);
    const platforms = groupByCategory(allChannels, categoriesData);

    loadPlatforms(platforms);

    // Event listeners for search functionality
    searchInput.addEventListener('input', onSearch);
    searchButton.addEventListener('click', onSearch);
  } catch (error) {
    console.error('Error initializing application:', error);
  }
}

function loadPlatforms(platforms) {
  platformsList.innerHTML = '';

  Object.keys(platforms).forEach(categoryId => {
    const platformElement = document.createElement('div');
    platformElement.className = 'platform';
    platformElement.setAttribute('data-category', categoryId);
    platformElement.innerHTML = `<i class="fas fa-layer-group"></i> ${platforms[categoryId].name}`;
    platformElement.onclick = () => loadChannels(platforms[categoryId].channels);
    platformsList.appendChild(platformElement);
  });
}

function loadChannels(channels) {
  channelsList.innerHTML = '';

  channels.forEach(channel => {
    const channelElement = document.createElement('div');
    channelElement.className = 'channel';
    channelElement.innerHTML = `<i class="fas fa-tv"></i> ${channel.name}`;
    channelElement.onclick = () => playChannel(channel);
    channelsList.appendChild(channelElement);
  });
}

function playChannel(channel) {
  const streamUrl = channel.url;

  if (!streamUrl) {
    alert('Stream URL not available for this channel.');
    return;
  }

  if (Hls.isSupported()) {
    const hls = new Hls();
    hls.loadSource(streamUrl);
    hls.attachMedia(videoPlayer);
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
      videoPlayer.play();
    });
  } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
    videoPlayer.src = streamUrl;
    videoPlayer.addEventListener('loadedmetadata', function() {
      videoPlayer.play();
    });
  } else {
    alert('Your browser does not support HLS streaming.');
  }

  channelInfo.innerHTML = `<i class="fas fa-tv"></i> Now Playing: ${channel.name}`;
  loadSchedule(channel);
}

async function loadSchedule(channel) {
  scheduleList.innerHTML = '';
  try {
    const guideData = await fetchGuide(channel);
    if (guideData && guideData.length > 0) {
      guideData.forEach(program => {
        const programElement = document.createElement('li');
        programElement.textContent = `${program.startTime} - ${program.endTime}: ${program.title}`;
        scheduleList.appendChild(programElement);
      });
    } else {
      scheduleList.innerHTML = '<li>No schedule available for this channel.</li>';
    }
  } catch (error) {
    console.error('Error fetching schedule:', error);
    scheduleList.innerHTML = '<li>Error fetching schedule.</li>';
  }
}

function onSearch() {
  const query = searchInput.value.toLowerCase();
  const filteredChannels = allChannels.filter(channel =>
    channel.name.toLowerCase().includes(query)
  );
  loadChannels(filteredChannels);
}

init();