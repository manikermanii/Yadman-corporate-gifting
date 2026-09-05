import { Request, Response, NextFunction } from 'express';
import { inquiriesService } from '../services/inquiriesService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { corporateInquirySchema, consultationSchema } from '../validators/index.js';

export class InquiriesController {
  // Corporate inquiries
  async createCorporateInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = corporateInquirySchema.parse(req.body);
      const inquiry = await inquiriesService.createCorporateInquiry({
        ...validated,
        userId: req.user?.userId,
      });
      return sendSuccess(res, inquiry, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async getCorporateInquiriesAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await inquiriesService.getCorporateInquiries();
      return sendSuccess(res, list);
    } catch (err: any) {
      next(err);
    }
  }

  async updateCorporateInquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await inquiriesService.updateCorporateInquiry(id, req.body);
      return sendSuccess(res, updated);
    } catch (err: any) {
      next(err);
    }
  }

  // Consultation requests
  async createConsultation(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = consultationSchema.parse(req.body);
      const consultation = await inquiriesService.createConsultation({
        ...validated,
        userId: req.user?.userId,
      });
      return sendSuccess(res, consultation, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async getConsultationsAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await inquiriesService.getConsultations();
      return sendSuccess(res, list);
    } catch (err: any) {
      next(err);
    }
  }

  async updateConsultation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await inquiriesService.updateConsultation(id, req.body);
      return sendSuccess(res, updated);
    } catch (err: any) {
      next(err);
    }
  }

  // Custom Gift Boxes
  async createCustomGiftBox(req: Request, res: Response, next: NextFunction) {
    try {
      const box = await inquiriesService.createCustomGiftBox({
        ...req.body,
        userId: req.user?.userId,
      });
      return sendSuccess(res, box, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async getCustomGiftBoxesAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const list = await inquiriesService.getCustomGiftBoxes();
      return sendSuccess(res, list);
    } catch (err: any) {
      next(err);
    }
  }
}

export const inquiriesController = new InquiriesController();
