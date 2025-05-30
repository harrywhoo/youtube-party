// Keep track of the current party
let currentPartyCode: string | null = null;
let socket: WebSocket | null = null;

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAYER_EVENT' && currentPartyCode) {
    // Forward player events to the server
    socket?.send(JSON.stringify({
      type: 'videoUpdate',
      partyCode: currentPartyCode,
      action: message.action,
      timestamp: message.timestamp
    }));
  }
});

// Connect to WebSocket server
function connectToServer() {
  if (socket) {
    socket.close();
  }

  socket = new WebSocket('ws://localhost:3000');

  socket.onopen = () => {
    console.log('Connected to server');
  };

  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    if (message.type === 'videoUpdate') {
      // Forward video updates to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'VIDEO_UPDATE',
            action: message.action,
            timestamp: message.timestamp
          });
        }
      });
    }
  };

  socket.onclose = () => {
    console.log('Disconnected from server');
    // Try to reconnect after a delay
    setTimeout(connectToServer, 5000);
  };
}

// Initialize connection
connectToServer(); 