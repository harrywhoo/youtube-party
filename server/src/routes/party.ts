import express from 'express';
import { Party } from '../models/Party';

const router = express.Router();

// Create a new party
router.post('/create', async (req, res) => {
  try {
    const { hostId, hostName } = req.body;
    
    // Create a new party
    const party = new Party({
      host: hostId,
      members: [{
        id: hostId,
        name: hostName,
        isHost: true
      }]
    });

    // Save the party to the database
    await party.save();

    // Return the party code and details
    res.json({
      success: true,
      party: {
        code: party.code,
        host: party.host,
        members: party.members
      }
    });
  } catch (error) {
    console.error('Error creating party:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create party'
    });
  }
});

// Join an existing party
router.post('/join', async (req, res) => {
  try {
    const { code, memberId, memberName } = req.body;
    
    // Find the party by code
    const party = await Party.findOne({ code });
    
    if (!party) {
      return res.status(404).json({
        success: false,
        error: 'Party not found'
      });
    }

    // Check if member is already in the party
    const existingMember = party.members.find(m => m.id === memberId);
    if (existingMember) {
      return res.json({
        success: true,
        party: {
          code: party.code,
          host: party.host,
          members: party.members,
          currentVideo: party.currentVideo
        }
      });
    }

    // Add new member to the party
    party.members.push({
      id: memberId,
      name: memberName,
      isHost: false
    });

    await party.save();

    res.json({
      success: true,
      party: {
        code: party.code,
        host: party.host,
        members: party.members,
        currentVideo: party.currentVideo
      }
    });
  } catch (error) {
    console.error('Error joining party:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join party'
    });
  }
});

export default router; 