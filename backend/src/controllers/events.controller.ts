import { Request, Response } from 'express';
import { HttpResponse } from '../utils/http-response.js';
import { EventModel } from '../models/event.model.js';
import { logger } from '../config/logger.js';

export class EventsController {
  static async getUpcoming(req: Request, res: Response): Promise<void> {
    try {
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
      const offset = (page - 1) * pageSize;

      const { events, total } = await EventModel.findUpcoming(pageSize, offset);
      HttpResponse.paginated(res, events, total, page, pageSize);
    } catch (error) {
      logger.error('Error getting events', { error });
      HttpResponse.internalError(res);
    }
  }

  static async getByCountry(req: Request, res: Response): Promise<void> {
    try {
      const { country } = req.params;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const pageSize = Math.min(100, parseInt(req.query.pageSize as string) || 20);
      const offset = (page - 1) * pageSize;

      const { events, total } = await EventModel.findByCountry(country, pageSize, offset);
      HttpResponse.paginated(res, events, total, page, pageSize);
    } catch (error) {
      logger.error('Error getting events by country', { error });
      HttpResponse.internalError(res);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await EventModel.findById(id);
      if (!event) {
        HttpResponse.notFound(res);
        return;
      }
      HttpResponse.success(res, event);
    } catch (error) {
      logger.error('Error getting event', { error });
      HttpResponse.internalError(res);
    }
  }
}
