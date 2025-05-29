import { useState } from 'react'
import './App.css'

type PartyState = 'initial' | 'creating' | 'joining' | 'inParty'

function App() {
  const [partyState, setPartyState] = useState<PartyState>('initial')
  const [partyCode, setPartyCode] = useState('')
  
  const handleCreateParty = async () => {
    setPartyState('creating')
    // TODO: Implement party creation logic
  }

  const handleJoinParty = async () => {
    if (!partyCode.trim()) return
    setPartyState('joining')
    // TODO: Implement party joining logic
  }

  return (
    <div className="container">
      <header>
        <h1>🎉 YouTube Party</h1>
        <p className="subtitle">Watch videos together with friends in real-time</p>
      </header>

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

        {partyState === 'inParty' && (
          <div className="party-container">
            <div className="video-section">
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
                <p className="empty-chat">No messages yet. Be the first to say hello!</p>
              </div>
              <div className="chat-input">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="input-field"
                />
                <button className="send-button">Send</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App