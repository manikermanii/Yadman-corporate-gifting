import { Request, Response, NextFunction } from 'express';
import { cmsService } from '../services/cmsService.js';
import { sendSuccess } from '../utils/apiResponse.js';

export class CmsController {
  async getHomepageCMS(req: Request, res: Response, next: NextFunction) {
    try {
      const cms = await cmsService.getHomepageCMS();
      return sendSuccess(res, cms);
    } catch (err: any) {
      next(err);
    }
  }

  async updateHomepageCMS(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await cmsService.updateHomepageCMS(req.body);
      return sendSuccess(res, updated);
    } catch (err: any) {
      next(err);
    }
  }

  async resetHomepageCMS(req: Request, res: Response, next: NextFunction) {
    try {
      const reset = await cmsService.resetHomepageCMS();
      return sendSuccess(res, reset);
    } catch (err: any) {
      next(err);
    }
  }

  async getSiteSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await cmsService.getSiteSettings();
      return sendSuccess(res, settings);
    } catch (err: any) {
      next(err);
    }
  }

  async updateSiteSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await cmsService.updateSiteSettings(req.body);
      return sendSuccess(res, updated);
    } catch (err: any) {
      next(err);
    }
  }

  async getSeoSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const seo = await cmsService.getSeoSettings();
      return sendSuccess(res, seo);
    } catch (err: any) {
      next(err);
    }
  }
}

export const cmsController = new CmsController();
