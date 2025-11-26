import { Router, Request, Response } from 'express';
import { mockEvents } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
import { economicCalendarClient } from '../integrations/economicCalendar.client.js';
import { economicCalendarRealClient } from '../integrations/economicCalendarReal.client.js';
import { fredClient } from '../integrations/fred.client.js';
import { worldBankClient } from '../integrations/worldBank.client.js';
import { logger } from '../config/logger.js';

const router = Router();

// Get economic events with LIVE data
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const country = req.query.country as string | undefined;
    const impact = req.query.impact as string | undefined;
    
    // Get live economic events
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Next 30 days
    
    // Try real client first (no key required), fallback to generic client/mock
    let events = await economicCalendarRealClient.getUpcomingEvents(
      startDate,
      endDate,
      country,
      impact
    );

    if (!events || events.length === 0) {
      events = await economicCalendarClient.getUpcomingEvents(
        startDate,
        endDate,
        country,
        impact
      );
    }
    
    // Transform to match frontend format
    const transformedEvents = events.map((event: any) => ({
      id: `${event.title}-${event.date.getTime()}`,
      title: event.title,
      date: event.date.toISOString(),
      country: event.country,
      impact: event.impact,
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual,
      currency: event.currency,
    }));
    
    // Paginate
    const offset = (page - 1) * pageSize;
    const filtered = transformedEvents.slice(offset, offset + pageSize);
    
    HttpResponse.paginated(res, filtered, transformedEvents.length, page, pageSize);
  } catch (error) {
    logger.error('Error fetching economic events:', error);
    // Fallback to generated upcoming events
    const upcomingEvents = generateUpcomingEvents();
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const offset = (page - 1) * pageSize;
    const filtered = upcomingEvents.slice(offset, offset + pageSize);
    HttpResponse.paginated(res, filtered, upcomingEvents.length, page, pageSize);
  }
});

// Generate upcoming events (fallback when APIs fail)
function generateUpcomingEvents() {
  const now = new Date();
  return [
    {
      id: 'event-1',
      title: 'U.S. Non-Farm Payrolls',
      date: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      country: 'US',
      impact: 'high',
      forecast: '185K',
      previous: '199K',
      actual: null,
      currency: 'USD'
    },
    {
      id: 'event-2',
      title: 'ECB Interest Rate Decision',
      date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      country: 'EU',
      impact: 'high',
      forecast: '4.50%',
      previous: '4.50%',
      actual: null,
      currency: 'EUR'
    },
    {
      id: 'event-3',
      title: 'U.S. Consumer Price Index (CPI)',
      date: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      country: 'US',
      impact: 'high',
      forecast: '3.2%',
      previous: '3.7%',
      actual: null,
      currency: 'USD'
    },
    {
      id: 'event-4',
      title: 'Japan GDP Growth Rate',
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      country: 'JP',
      impact: 'medium',
      forecast: '0.8%',
      previous: '1.2%',
      actual: null,
      currency: 'JPY'
    },
    {
      id: 'event-5',
      title: 'UK Retail Sales',
      date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      country: 'GB',
      impact: 'medium',
      forecast: '0.3%',
      previous: '-0.3%',
      actual: null,
      currency: 'GBP'
    }
  ];
}

// Get event by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    // For now, get all events and find by ID
    let events = await economicCalendarRealClient.getUpcomingEvents();
    if (!events || events.length === 0) {
      events = await economicCalendarClient.getUpcomingEvents();
    }
    const event = events.find((e: any) => 
      `${e.title}-${e.date.getTime()}` === req.params.id
    );
    
    if (!event) {
      HttpResponse.notFound(res);
      return;
    }
    
    const transformedEvent = {
      id: req.params.id,
      title: event.title,
      date: event.date.toISOString(),
      country: event.country,
      impact: event.impact,
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual,
      currency: event.currency,
    };
    
    HttpResponse.success(res, transformedEvent);
  } catch (error) {
    logger.error('Error fetching event:', error);
    const event = mockEvents.find(e => e.id === req.params.id);
    if (!event) {
      HttpResponse.notFound(res);
      return;
    }
    HttpResponse.success(res, event);
  }
});

// Get events by country
router.get('/country/:country', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    
    let events = await economicCalendarRealClient.getUpcomingEvents(undefined, undefined, req.params.country);
    if (!events || events.length === 0) {
      events = await economicCalendarClient.getEventsByCountry(req.params.country);
    }
    
    const transformedEvents = events.map((event: any) => ({
      id: `${event.title}-${event.date.getTime()}`,
      title: event.title,
      date: event.date.toISOString(),
      country: event.country,
      impact: event.impact,
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual,
      currency: event.currency,
    }));
    
    const offset = (page - 1) * pageSize;
    const filtered = transformedEvents.slice(offset, offset + pageSize);
    
    HttpResponse.paginated(res, filtered, transformedEvents.length, page, pageSize);
  } catch (error) {
    logger.error('Error fetching events by country:', error);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
    const offset = (page - 1) * pageSize;
    const filtered = mockEvents.filter(e => e.country === req.params.country).slice(offset, offset + pageSize);
    const total = mockEvents.filter(e => e.country === req.params.country).length;
    HttpResponse.paginated(res, filtered, total, page, pageSize);
  }
});

// Get high-impact events only
router.get('/impact/high', async (req: Request, res: Response) => {
  try {
    let events = await economicCalendarRealClient.getUpcomingEvents(undefined, undefined, undefined, 'High');
    if (!events || events.length === 0) {
      events = await economicCalendarClient.getHighImpactEvents();
    }
    
    const transformedEvents = events.map((event: any) => ({
      id: `${event.title}-${event.date.getTime()}`,
      title: event.title,
      date: event.date.toISOString(),
      country: event.country,
      impact: event.impact,
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual,
      currency: event.currency,
    }));
    
    HttpResponse.success(res, transformedEvents);
  } catch (error) {
    logger.error('Error fetching high-impact events:', error);
    HttpResponse.error(res, 'Failed to fetch high-impact events', 500);
  }
});

// Get today's events
router.get('/today', async (req: Request, res: Response) => {
  try {
    let events = await economicCalendarRealClient.getUpcomingEvents(new Date(), new Date());
    if (!events || events.length === 0) {
      events = await economicCalendarClient.getTodayEvents();
    }
    
    const transformedEvents = events.map((event: any) => ({
      id: `${event.title}-${event.date.getTime()}`,
      title: event.title,
      date: event.date.toISOString(),
      country: event.country,
      impact: event.impact,
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual,
      currency: event.currency,
    }));
    
    HttpResponse.success(res, transformedEvents);
  } catch (error) {
    logger.error('Error fetching today events:', error);
    HttpResponse.error(res, 'Failed to fetch today events', 500);
  }
});

export default router;
