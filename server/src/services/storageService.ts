import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config/env.js';

export interface StorageFile {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
}

export interface StoredFileResult {
  url: string;
  key: string;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageProvider {
  uploadFile(file: StorageFile, folder?: string): Promise<StoredFileResult>;
  deleteFile(key: string): Promise<boolean>;
  saveVoiceRecording(base64Data: string, mimeType?: string): Promise<string>;
}

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    const localPath = (config as any).storageLocalPath || config.uploadDir || 'uploads';
    this.uploadDir = path.resolve(process.cwd(), localPath);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadFile(file: StorageFile, folder = 'images'): Promise<StoredFileResult> {
    const targetDir = path.join(this.uploadDir, folder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const ext = path.extname(file.originalName) || '.png';
    const randomHash = crypto.randomBytes(8).toString('hex');
    const fileName = `${Date.now()}-${randomHash}${ext}`;
    const filePath = path.join(targetDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const relativeUrl = `/uploads/${folder}/${fileName}`;
    return {
      url: relativeUrl,
      key: `${folder}/${fileName}`,
      sizeBytes: file.sizeBytes,
      mimeType: file.mimeType,
    };
  }

  async deleteFile(key: string): Promise<boolean> {
    try {
      const filePath = path.join(this.uploadDir, key);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async saveVoiceRecording(base64Data: string, mimeType = 'audio/webm'): Promise<string> {
    const targetDir = path.join(this.uploadDir, 'voices');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let cleanBase64 = base64Data;
    if (base64Data.includes(';base64,')) {
      cleanBase64 = base64Data.split(';base64,')[1];
    }

    const buffer = Buffer.from(cleanBase64, 'base64');
    const ext = mimeType.includes('mp4') ? '.m4a' : mimeType.includes('mp3') ? '.mp3' : '.webm';
    const fileName = `voice-${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(targetDir, fileName);

    fs.writeFileSync(filePath, buffer);
    return `/uploads/voices/${fileName}`;
  }
}

// Factory to get active storage provider
export const storageService: StorageProvider = new LocalStorageProvider();
