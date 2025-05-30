import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import './App.css'

type PartyState = 'initial' | 'creating' | 'joining' | 'inParty'
type PartyMember = {
  id: string;
  name: string;
  isHost: boolean;
}

type Party = {
  code: string;
  host: string;
  members: PartyMember[];
  currentVideo?: {
    id: string;
    title: string;
    timestamp: number;
  };
}

function App() {
  const [partyState, setPartyState] = useState<PartyState>('initial')
  const [partyCode, setPartyCode] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [party, setParty] = useState<Party | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{
    message: string;
    user: string;
    timestamp: Date;
  }>>([])
  const [newMessage, setNewMessage] = useState('')

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:3000')
    setSocket(newSocket)

    // Socket event listeners
    newSocket.on('videoUpdate', (data) => {
      // Handle video updates
      console.log('Video update:', data)
    })

    newSocket.on('chatMessage', (data) => {
      setChatMessages(prev => [...prev, data])
    })

    return () => {
      newSocket.close()
    }
  }, [])

  const handleCreateParty = async () => {
    try {
      setPartyState('creating')
      setError(null)

      // Generate a temporary user ID (in a real app, this would come from authentication)
      const userId = Math.random().toString(36).substring(7)
      const userName = `User${userId.substring(0, 4)}`

      const response = await fetch('http://localhost:3000/api/party/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostId: userId,
          hostName: userName,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to create party')
      }

      setParty(data.party)
      socket?.emit('joinParty', data.party.code)
      setPartyState('inParty')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create party')
      setPartyState('initial')
    }
  }

  const handleJoinParty = async () => {
    if (!partyCode.trim()) return

    try {
      setPartyState('joining')
      setError(null)

      // Generate a temporary user ID (in a real app, this would come from authentication)
      const userId = Math.random().toString(36).substring(7)
      const userName = `User${userId.substring(0, 4)}`

      const response = await fetch('http://localhost:3000/api/party/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: partyCode.trim(),
          memberId: userId,
          memberName: userName,
        }),
      })

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to join party')
      }

      setParty(data.party)
      socket?.emit('joinParty', data.party.code)
      setPartyState('inParty')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join party')
      setPartyState('initial')
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !party) return

    socket.emit('chatMessage', {
      partyCode: party.code,
      message: newMessage.trim(),
      user: party.members.find(m => m.id === socket.id)?.name || 'Anonymous'
    })

    setNewMessage('')
  }

  return (
    <div className="container">
      <header>
        <h1>🎉 YouTube Party</h1>
        <p className="subtitle">Watch videos together with friends in real-time</p>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <main>
        {partyState === 'initial' && (
          <div className="party-form">
            <h2>Get Started</h2>
            <div className="button-group">
              <div className="create-section">
                <p>Create a new party room to watch videos with friends</p>
                <button
                  onClick={handleCreateParty}
                  className="primary-button"
                >
                  🎥 Create New Party
                </button>
              </div>
              
              <div className="divider">
                <span>OR</span>
              </div>
              
              <div className="join-section">
                <p>Join an existing party with a code</p>
                <input
                  type="text"
                  value={partyCode}
                  onChange={(e) => setPartyCode(e.target.value)}
                  placeholder="Enter your party code"
                  className="input-field"
                />
                <button
                  onClick={handleJoinParty}
                  className="secondary-button"
                  disabled={!partyCode.trim()}
                >
                  👥 Join Party
                </button>
              </div>
            </div>
          </div>
        )}

        {partyState === 'creating' && (
          <div className="loading">
            <div className="spinner"></div>
            <h3>Creating your party room...</h3>
            <p>This will only take a moment</p>
          </div>
        )}

        {partyState === 'joining' && (
          <div className="loading">
            <div className="spinner"></div>
            <h3>Joining party room...</h3>
            <p>Connecting you to your friends</p>
          </div>
        )}

        {partyState === 'inParty' && party && (
          <div className="party-container">
            <div className="video-section">
              <div className="party-info">
                <h2>Party Code: {party.code}</h2>
                <p>Share this code with your friends to join the party!</p>
              </div>
              <div className="video-placeholder">
                <h2>Welcome to YouTube Party! 🎉</h2>
                <p className="lead">Share moments together, no matter the distance</p>
                <div className="instructions">
                  <h3>Quick Start Guide:</h3>
                  <ol>
                    <li>Open any YouTube video you want to watch</li>
                    <li>Click the YouTube Party extension icon in your browser</li>
                    <li>Share your party code with friends to watch together</li>
                  </ol>
                </div>
                <p className="note">The video player will appear here once connected</p>
              </div>
            </div>

            <div className="chat-section">
              <h2>💬 Party Chat</h2>
              <div className="chat-messages">
                {chatMessages.length === 0 ? (
                  <p className="empty-chat">No messages yet. Be the first to say hello!</p>
                ) : (
                  chatMessages.map((msg, index) => (
                    <div key={index} className="chat-message">
                      <span className="chat-user">{msg.user}:</span>
                      <span className="chat-text">{msg.message}</span>
                      <span className="chat-time">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="input-field"
                />
                <button 
                  onClick={handleSendMessage}
                  className="send-button"
                  disabled={!newMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App