import { EventModel } from '../models/event.model.js';
import { economicCalendarClient } from '../integrations/economicCalendar.client.js';
import { logger } from '../config/logger.js';

export class EventsService {
  /**
   * Get all events with optional filters
   */
  static async getEvents(
    limit = 50,
    offset = 0,
    country?: string,
    impact?: string
  ) {
    try {
      // Get events from external API
      const externalEvents = await economicCalendarClient.getUpcomingEvents(
        undefined,
        undefined,
        country,
        impact
      );

      // If we have external data, use it
      if (externalEvents && externalEvents.length > 0) {
        return {
          events: externalEvents.slice(offset, offset + limit),
          total: externalEvents.length,
        };
      }

      // Fallback to database
      return EventModel.findUpcoming(limit, offset);
    } catch (error) {
      logger.error('Error in getEvents:', error);
      // Fallback to database on error
      return EventModel.findUpcoming(limit, offset);
    }
  }

  /**
   * Get single event by ID
   */
  static async getEventById(id: string) {
    return EventModel.findById(id);
  }

  /**
   * Get events by country
   */
  static async getEventsByCountry(country: string, limit = 50) {
    try {
      const events = await economicCalendarClient.getEventsByCountry(country);
      return {
        events: events.slice(0, limit),
        total: events.length,
      };
    } catch (error) {
      logger.error('Error in getEventsByCountry:', error);
      return EventModel.findByCountry(country, limit, 0);
    }
  }

  /**
   * Get high impact events
   */
  static async getHighImpactEvents(limit = 20) {
    try {
      const events = await economicCalendarClient.getHighImpactEvents();
      return {
        events: events.slice(0, limit),
        total: events.length,
      };
    } catch (error) {
      logger.error('Error in getHighImpactEvents:', error);
      return EventModel.findUpcoming(limit, 0);
    }
  }

  /**
   * Get today's events
   */
  static async getTodayEvents() {
    try {
      const events = await economicCalendarClient.getTodayEvents();
      return {
        events,
        total: events.length,
      };
    } catch (error) {
      logger.error('Error in getTodayEvents:', error);
      return { events: [], total: 0 };
    }
  }

  /**
   * Sync events from external API to database (for cron job)
   */
  static async syncEvents(): Promise<void> {
    try {
      logger.info('Syncing economic events from external API');

      const events = await economicCalendarClient.getUpcomingEvents();

      if (!events || events.length === 0) {
        logger.debug('No events to sync');
        return;
      }

      let syncedCount = 0;
      for (const event of events) {
        try {
          // Check if event already exists
          const existing = await EventModel.findByTitleAndDate(
            event.title,
            event.date
          );

          if (!existing) {
            await EventModel.create({
              title: event.title,
              event_date: event.date,
              country: event.country,
              impact: event.impact,
              forecast: event.forecast,
              previous: event.previous,
              actual: event.actual,
            });
            syncedCount++;
          }
        } catch (error) {
          logger.warn(`Failed to sync event: ${event.title}`, error);
        }
      }

      logger.info(`Synced ${syncedCount} new economic events`);
    } catch (error) {
      logger.error('Error syncing events:', error);
    }
  }
}
