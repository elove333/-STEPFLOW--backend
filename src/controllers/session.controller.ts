import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Session from '../models/Session.model';
import { processMetrics } from '../utils/metrics';
import { getAIFeedback } from '../services/ai.service';

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const { startTime, endTime, steps, distance, movementData, metadata } = req.body;

    // Validate input
    if (!startTime || !endTime || steps === undefined || distance === undefined) {
      return res.status(400).json({ 
        error: 'startTime, endTime, steps, and distance are required' 
      });
    }

    // Process metrics
    const metrics = processMetrics({
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      steps,
      distance,
      movementData: movementData || [],
    });

    // Create session
    const session = new Session({
      userId: req.userId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: metrics.duration,
      steps,
      distance,
      avgPace: metrics.avgPace,
      calories: metrics.calories,
      movementData: movementData || [],
      metadata: metadata || {},
    });

    await session.save();

    // Get AI feedback asynchronously
    getAIFeedback(session._id.toString(), session.toObject())
      .catch((error) => console.error('AI feedback error:', error));

    res.status(201).json({
      message: 'Session created successfully',
      session: {
        id: session._id,
        ...session.toObject(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessions = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, limit = 50, skip = 0 } = req.query;

    const query: any = { userId: req.userId };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate as string);
      if (endDate) query.startTime.$lte = new Date(endDate as string);
    }

    const sessions = await Session.find(query)
      .sort({ startTime: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Session.countDocuments(query);

    res.status(200).json({
      sessions,
      pagination: {
        total,
        limit: Number(limit),
        skip: Number(skip),
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSessionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const session = await Session.findOne({ _id: id, userId: req.userId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json({ session });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSession = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const session = await Session.findOneAndDelete({ 
      _id: id, 
      userId: req.userId 
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.status(200).json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
