import { Request, Response, NextFunction } from 'express';
import { storageService } from '../services/storageService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export class UploadController {
  async uploadSingleImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        return sendError(res, 'NO_FILE', 'هیچ فایلی برای آپلود انتخاب نشده است.', 400);
      }

      const folder = (req.body.folder as string) || 'products';
      const stored = await storageService.uploadFile(
        {
          originalName: file.originalname,
          mimeType: file.mimetype,
          sizeBytes: file.size,
          buffer: file.buffer,
        },
        folder
      );

      return sendSuccess(res, stored, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async uploadMultipleImages(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return sendError(res, 'NO_FILES', 'فایلی برای آپلود یافت نشد.', 400);
      }

      const folder = (req.body.folder as string) || 'products';
      const uploadedResults = await Promise.all(
        files.map((file) =>
          storageService.uploadFile(
            {
              originalName: file.originalname,
              mimeType: file.mimetype,
              sizeBytes: file.size,
              buffer: file.buffer,
            },
            folder
          )
        )
      );

      return sendSuccess(res, uploadedResults, 201);
    } catch (err: any) {
      next(err);
    }
  }

  async uploadVoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { base64Data, mimeType } = req.body;
      if (!base64Data) {
        return sendError(res, 'NO_AUDIO_DATA', 'داده‌های صوتی دریافت نشد.', 400);
      }

      const url = await storageService.saveVoiceRecording(base64Data, mimeType);
      return sendSuccess(res, { url }, 201);
    } catch (err: any) {
      next(err);
    }
  }
}

export const uploadController = new UploadController();
