import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Session from '../models/Session.model';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'weekly', startDate, endDate } = req.query;

    const query: any = { userId: req.userId };

    // Calculate date range based on period
    let start: Date;
    let end: Date = new Date();

    if (startDate && endDate) {
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      switch (period) {
        case 'daily':
          start = new Date();
          start.setHours(0, 0, 0, 0);
          break;
        case 'weekly':
          start = new Date();
          start.setDate(start.getDate() - 7);
          break;
        case 'monthly':
          start = new Date();
          start.setMonth(start.getMonth() - 1);
          break;
        default:
          start = new Date();
          start.setDate(start.getDate() - 7);
      }
    }

    query.startTime = { $gte: start, $lte: end };

    // Aggregate session data
    const sessions = await Session.find(query);

    const analytics = {
      period,
      startDate: start,
      endDate: end,
      totalSteps: 0,
      totalDistance: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgPace: 0,
      sessionsCount: sessions.length,
    };

    sessions.forEach((session) => {
      analytics.totalSteps += session.steps;
      analytics.totalDistance += session.distance;
      analytics.totalDuration += session.duration;
      analytics.totalCalories += session.calories;
    });

    if (sessions.length > 0) {
      analytics.avgPace = sessions.reduce((sum, s) => sum + s.avgPace, 0) / sessions.length;
    }

    res.status(200).json({ analytics });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const sessions = await Session.find({
      userId: req.userId,
      startTime: { $gte: startDate },
    }).sort({ startTime: 1 });

    // Group by date
    const progressByDate = new Map<string, any>();

    sessions.forEach((session) => {
      const dateKey = session.startTime.toISOString().split('T')[0];
      
      if (!progressByDate.has(dateKey)) {
        progressByDate.set(dateKey, {
          date: dateKey,
          steps: 0,
          distance: 0,
          duration: 0,
          calories: 0,
          sessionsCount: 0,
        });
      }

      const dayProgress = progressByDate.get(dateKey);
      dayProgress.steps += session.steps;
      dayProgress.distance += session.distance;
      dayProgress.duration += session.duration;
      dayProgress.calories += session.calories;
      dayProgress.sessionsCount += 1;
    });

    const progress = Array.from(progressByDate.values());

    res.status(200).json({ progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    // Get all-time stats
    const allSessions = await Session.find({ userId: req.userId });

    const stats = {
      totalSessions: allSessions.length,
      totalSteps: 0,
      totalDistance: 0,
      totalDuration: 0,
      totalCalories: 0,
      avgStepsPerSession: 0,
      avgDistancePerSession: 0,
      avgDurationPerSession: 0,
      avgPace: 0,
    };

    allSessions.forEach((session) => {
      stats.totalSteps += session.steps;
      stats.totalDistance += session.distance;
      stats.totalDuration += session.duration;
      stats.totalCalories += session.calories;
    });

    if (allSessions.length > 0) {
      stats.avgStepsPerSession = stats.totalSteps / allSessions.length;
      stats.avgDistancePerSession = stats.totalDistance / allSessions.length;
      stats.avgDurationPerSession = stats.totalDuration / allSessions.length;
      stats.avgPace = allSessions.reduce((sum, s) => sum + s.avgPace, 0) / allSessions.length;
    }

    res.status(200).json({ stats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
