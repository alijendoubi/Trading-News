import { Router } from 'express';
import { mockEvents } from '../services/mock-data.service.js';
import { HttpResponse } from '../utils/http-response.js';
import { economicCalendarClient } from '../integrations/economicCalendar.client.js';
import { economicCalendarRealClient } from '../integrations/economicCalendarReal.client.js';
import { logger } from '../config/logger.js';
const router = Router();
// Get economic events with LIVE data
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
        const country = req.query.country;
        const impact = req.query.impact;
        // Get live economic events
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30); // Next 30 days
        // Try real client first (no key required), fallback to generic client/mock
        let events = await economicCalendarRealClient.getUpcomingEvents(startDate, endDate, country, impact);
        if (!events || events.length === 0) {
            events = await economicCalendarClient.getUpcomingEvents(startDate, endDate, country, impact);
        }
        // Transform to match frontend format
        const transformedEvents = events.map((event) => ({
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
    }
    catch (error) {
        logger.error('Error fetching economic events:', error);
        // Fallback to mock data
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
        const offset = (page - 1) * pageSize;
        const filtered = mockEvents.slice(offset, offset + pageSize);
        HttpResponse.paginated(res, filtered, mockEvents.length, page, pageSize);
    }
});
// Get event by ID
router.get('/:id', async (req, res) => {
    try {
        // For now, get all events and find by ID
        let events = await economicCalendarRealClient.getUpcomingEvents();
        if (!events || events.length === 0) {
            events = await economicCalendarClient.getUpcomingEvents();
        }
        const event = events.find((e) => `${e.title}-${e.date.getTime()}` === req.params.id);
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
    }
    catch (error) {
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
router.get('/country/:country', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
        let events = await economicCalendarRealClient.getUpcomingEvents(undefined, undefined, req.params.country);
        if (!events || events.length === 0) {
            events = await economicCalendarClient.getEventsByCountry(req.params.country);
        }
        const transformedEvents = events.map((event) => ({
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
    }
    catch (error) {
        logger.error('Error fetching events by country:', error);
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const pageSize = Math.min(100, parseInt(req.query.pageSize) || 20);
        const offset = (page - 1) * pageSize;
        const filtered = mockEvents.filter(e => e.country === req.params.country).slice(offset, offset + pageSize);
        const total = mockEvents.filter(e => e.country === req.params.country).length;
        HttpResponse.paginated(res, filtered, total, page, pageSize);
    }
});
// Get high-impact events only
router.get('/impact/high', async (req, res) => {
    try {
        let events = await economicCalendarRealClient.getUpcomingEvents(undefined, undefined, undefined, 'High');
        if (!events || events.length === 0) {
            events = await economicCalendarClient.getHighImpactEvents();
        }
        const transformedEvents = events.map((event) => ({
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
    }
    catch (error) {
        logger.error('Error fetching high-impact events:', error);
        HttpResponse.error(res, 'Failed to fetch high-impact events', 500);
    }
});
// Get today's events
router.get('/today', async (req, res) => {
    try {
        let events = await economicCalendarRealClient.getUpcomingEvents(new Date(), new Date());
        if (!events || events.length === 0) {
            events = await economicCalendarClient.getTodayEvents();
        }
        const transformedEvents = events.map((event) => ({
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
    }
    catch (error) {
        logger.error('Error fetching today events:', error);
        HttpResponse.error(res, 'Failed to fetch today events', 500);
    }
});
export default router;
//# sourceMappingURL=events.routes.js.map