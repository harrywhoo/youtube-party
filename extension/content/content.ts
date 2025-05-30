// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'VIDEO_UPDATE') {
    // Handle video updates from other party members
    const player = document.querySelector<HTMLVideoElement>('video');
    if (player) {
      switch (message.action) {
        case 'play':
          player.play();
          break;
        case 'pause':
          player.pause();
          break;
        case 'seek':
          player.currentTime = message.timestamp;
          break;
      }
    }
  }
});

// Watch for YouTube player events
function setupPlayerListener() {
  const player = document.querySelector<HTMLVideoElement>('video');
  if (!player) {
    // If player isn't available yet, try again in a moment
    setTimeout(setupPlayerListener, 1000);
    return;
  }

  // Listen for player events
  player.addEventListener('play', () => {
    chrome.runtime.sendMessage({
      type: 'PLAYER_EVENT',
      action: 'play',
      timestamp: player.currentTime
    });
  });

  player.addEventListener('pause', () => {
    chrome.runtime.sendMessage({
      type: 'PLAYER_EVENT',
      action: 'pause',
      timestamp: player.currentTime
    });
  });

  player.addEventListener('seeked', () => {
    chrome.runtime.sendMessage({
      type: 'PLAYER_EVENT',
      action: 'seek',
      timestamp: player.currentTime
    });
  });
}

// Start watching for the player
setupPlayerListener(); 