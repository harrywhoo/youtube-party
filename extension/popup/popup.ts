import { Manager } from 'socket.io-client';

let socket: any = null;
let currentPartyCode: string | null = null;

// DOM Elements
const notInPartySection = document.getElementById('notInParty')!;
const inPartySection = document.getElementById('inParty')!;
const createPartyButton = document.getElementById('createParty')!;
const joinPartyButton = document.getElementById('joinParty')!;
const partyCodeInput = document.getElementById('partyCode') as HTMLInputElement;
const currentPartyCodeSpan = document.getElementById('currentPartyCode')!;
const membersList = document.getElementById('membersList')!;
const leavePartyButton = document.getElementById('leaveParty')!;
const errorDiv = document.getElementById('error')!;

// Verify DOM elements are found
console.log('DOM Elements initialized:', {
  notInPartySection: !!notInPartySection,
  inPartySection: !!inPartySection,
  createPartyButton: !!createPartyButton,
  joinPartyButton: !!joinPartyButton,
  partyCodeInput: !!partyCodeInput,
  currentPartyCodeSpan: !!currentPartyCodeSpan,
  membersList: !!membersList,
  leavePartyButton: !!leavePartyButton,
  errorDiv: !!errorDiv
});

// Initialize socket connection
function initializeSocket() {
  if (!socket) {
    console.log('Initializing socket connection...');
    const manager = new Manager('http://localhost:3000');
    socket = manager.socket('/');
    
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      errorDiv.classList.add('hidden');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      showError('Failed to connect to server');
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      showError('Disconnected from server');
      resetPartyState();
    });

    socket.on('partyUpdate', (data: { members: Array<{ id: string; name: string; isHost: boolean }> }) => {
      console.log('Received party update:', data);
      updateMembersList(data.members);
    });
  }
}

// Show error message
function showError(message: string) {
  errorDiv.textContent = message;
  errorDiv.classList.remove('hidden');
  setTimeout(() => {
    errorDiv.classList.add('hidden');
  }, 3000);
}

// Reset party state
function resetPartyState() {
  currentPartyCode = null;
  notInPartySection.classList.remove('hidden');
  inPartySection.classList.add('hidden');
  membersList.innerHTML = '';
}

// Update members list
function updateMembersList(members: Array<{ id: string; name: string; isHost: boolean }>) {
  membersList.innerHTML = members
    .map(member => `
      <li>
        ${member.name} ${member.isHost ? '(Host)' : ''}
      </li>
    `)
    .join('');
}

// Create a new party
async function handleCreateParty() {
  console.log('Creating party...');
  try {
    const userId = Math.random().toString(36).substring(7);
    const userName = `User${userId.substring(0, 4)}`;
    console.log('Generated user:', { userId, userName });

    console.log('Sending create party request...');
    const response = await fetch('http://localhost:3000/api/party/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostId: userId,
        hostName: userName,
      }),
    });

    console.log('Received response:', response.status);
    const data = await response.json();
    console.log('Party creation response:', data);

    if (!data.success) {
      throw new Error(data.error || 'Failed to create party');
    }

    currentPartyCode = data.party.code;
    console.log('Party created with code:', currentPartyCode);
    currentPartyCodeSpan.textContent = currentPartyCode;
    updateMembersList(data.party.members);

    console.log('Emitting joinParty event...');
    socket?.emit('joinParty', currentPartyCode);
    
    console.log('Updating UI state...');
    notInPartySection.classList.add('hidden');
    inPartySection.classList.remove('hidden');
    console.log('Party creation complete');
  } catch (err) {
    console.error('Party creation error:', err);
    showError(err instanceof Error ? err.message : 'Failed to create party');
  }
}

// Join an existing party
async function handleJoinParty() {
  const code = partyCodeInput.value.trim();
  if (!code) return;

  try {
    const userId = Math.random().toString(36).substring(7);
    const userName = `User${userId.substring(0, 4)}`;

    const response = await fetch('http://localhost:3000/api/party/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        memberId: userId,
        memberName: userName,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to join party');
    }

    currentPartyCode = data.party.code;
    currentPartyCodeSpan.textContent = currentPartyCode;
    updateMembersList(data.party.members);

    socket?.emit('joinParty', currentPartyCode);
    notInPartySection.classList.add('hidden');
    inPartySection.classList.remove('hidden');
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Failed to join party');
  }
}

// Leave the current party
function handleLeaveParty() {
  if (currentPartyCode) {
    socket?.emit('leaveParty', currentPartyCode);
    resetPartyState();
  }
}

// Event Listeners
console.log('Setting up event listeners...');
createPartyButton.addEventListener('click', (e) => {
  console.log('Create Party button clicked!', e);
  handleCreateParty();
});
joinPartyButton.addEventListener('click', handleJoinParty);
leavePartyButton.addEventListener('click', handleLeaveParty);

// Initialize
console.log('Initializing popup...');
initializeSocket();
console.log('Popup initialization complete'); 