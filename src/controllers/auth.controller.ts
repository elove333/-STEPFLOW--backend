// src/controllers/analytics.ts

import { Request, Response, NextFunction } from "express";

// Fundamental data structure for an analytics event
interface AnalyticsEvent {
  id: string;
  type: "page_view" | "click" | "custom";
  userId?: string;
  path?: string;
  label?: string;
  value?: number;
  timestamp: number;
}

// In‑memory “database” for analytics events
const analyticsEvents: AnalyticsEvent[] = [];

/**
 * GET /analytics/events
 * Return all analytics events (simple read controller).
 */
export const getAnalyticsEvents = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    res.status(200).json(analyticsEvents);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /analytics/events
 * Track a new analytics event (create controller).
 */
export const trackAnalyticsEvent = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const {
      type,
      userId,
      path,
      label,
      value,
    }: {
      type: AnalyticsEvent["type"];
      userId?: string;
      path?: string;
      label?: string;
      value?: number;
    } = req.body;

    if (!type) {
      res.status(400).json({ error: "type is required" });
      return;
    }

    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      type,
      userId,
      path,
      label,
      value,
      timestamp: Date.now(),
    };

    analyticsEvents.push(event);

    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /analytics/summary
 * Simple summary: count events by type.
 */
export const getAnalyticsSummary = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const summary: Record<string, number> = {};

    for (const event of analyticsEvents) {
      const key = event.type;
      summary[key] = (summary[key] ?? 0) + 1;
    }

    res.status(200).json(summary);
  } catch (error) {
    next(error);
  }
};
src/routes/analytics.ts
// src/routes/analytics.ts

import { Router } from "express";
import {
  getAnalyticsEvents,
  trackAnalyticsEvent,
  getAnalyticsSummary,
} from "../controllers/analytics";

const router = Router();

router.get("/events", getAnalyticsEvents);
router.post("/events", trackAnalyticsEvent);
router.get("/summary", getAnalyticsSummary);

export default router;
src/app.ts
// src/app.ts

import express from "express";
import analyticsRouter from "./routes/analytics";

const app = express();

app.use(express.json());

// Mount analytics routes under /analytics
app.use("/analytics", analyticsRouter);

export default app;
src/server.ts
// src/server.ts

import app from "./app";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log
(`Server listening on port ${PORT}`);
});src/
  features/
    analytics/
      analytics.controller.ts
      analytics.route.ts
      analytics.service.ts
      analytics.model.ts
      index.ts
    auth/
      auth.controller.ts
      auth.route.ts
      auth.service.ts
      auth.model.ts
    users/
      user.controller.ts
      user.route.ts
      user.service.ts
      user.model.ts
  config/
  middleware/
  utils/
  app.ts
  server.ts

