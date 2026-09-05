import { storageService } from './storageService.js';
import { prisma, isDbConnected } from '../config/database.js';

let inMemoryCorporateInquiries: any[] = [];
let inMemoryConsultations: any[] = [];
let inMemoryCustomGiftBoxes: any[] = [];

function formatInquiryFromPrisma(i: any) {
  return {
    ...i,
    status: i.status ? i.status.toLowerCase() : 'new',
    createdAt: i.createdAt ? i.createdAt.toISOString() : new Date().toISOString(),
    createdAtFa: new Intl.DateTimeFormat('fa-IR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(i.createdAt ? new Date(i.createdAt) : new Date()),
  };
}

export class InquiriesService {
  // Corporate inquiries
  async createCorporateInquiry(data: any) {
    let voiceUrl = data.voiceRecordingUrl || data.voiceRecording?.dataUrl;
    if (data.voiceRecording?.dataUrl) {
      voiceUrl = await storageService.saveVoiceRecording(
        data.voiceRecording.dataUrl,
        data.voiceRecording.mimeType
      );
    }

    const now = new Date();
    const inqNum = `CR-INQ-${Date.now().toString().slice(-4)}`;

    if (isDbConnected()) {
      try {
        const created = await prisma.corporateInquiry.create({
          data: {
            id: inqNum,
            inquiryNumber: inqNum,
            companyName: data.organizationName || data.companyName || 'سازمان / شرکت',
            contactName: data.contactPerson || data.fullName || 'مسئول خرید',
            phone: data.phoneNumber || data.phone || '',
            email: data.email || null,
            budgetPerBox: data.estimatedBudget ? String(data.estimatedBudget) : null,
            estimatedQuantity: data.estimatedQuantity ? String(data.estimatedQuantity) : null,
            deliveryDeadline: data.preferredDeliveryDate ? String(data.preferredDeliveryDate) : null,
            notes: data.description || data.notes || '',
            voiceRecordingUrl: voiceUrl || null,
            voiceDuration: data.voiceDuration || data.voiceRecording?.duration ? Number(data.voiceDuration || data.voiceRecording?.duration) : null,
            status: 'new',
            adminNotes: data.adminNotes || null,
          },
        });
        return formatInquiryFromPrisma(created);
      } catch (err) {
        console.warn('Prisma createCorporateInquiry fallback:', err);
      }
    }

    const newInquiry = {
      ...data,
      id: inqNum,
      status: 'new',
      createdAt: now.toISOString(),
      createdAtFa: new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(now),
    };

    inMemoryCorporateInquiries.unshift(newInquiry);
    return newInquiry;
  }

  async getCorporateInquiries() {
    if (isDbConnected()) {
      try {
        const items = await prisma.corporateInquiry.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return items.map(formatInquiryFromPrisma);
      } catch (err) {
        console.warn('Prisma getCorporateInquiries fallback:', err);
      }
    }
    return inMemoryCorporateInquiries;
  }

  async getCorporateInquiryById(id: string) {
    if (isDbConnected()) {
      try {
        const item = await prisma.corporateInquiry.findUnique({ where: { id } });
        if (item) return formatInquiryFromPrisma(item);
      } catch (err) {
        console.warn('Prisma getCorporateInquiryById fallback:', err);
      }
    }
    const item = inMemoryCorporateInquiries.find((i) => i.id === id);
    if (!item) throw new Error('درخواست سازمانی یافت نشد.');
    return item;
  }

  async updateCorporateInquiry(id: string, data: { status?: string; adminNotes?: string }) {
    if (isDbConnected()) {
      try {
        const updated = await prisma.corporateInquiry.update({
          where: { id },
          data: {
            status: data.status ? String(data.status).toLowerCase() : undefined,
            adminNotes: data.adminNotes !== undefined ? data.adminNotes : undefined,
          },
        });
        return formatInquiryFromPrisma(updated);
      } catch (err) {
        console.warn('Prisma updateCorporateInquiry fallback:', err);
      }
    }

    const item = inMemoryCorporateInquiries.find((i) => i.id === id);
    if (!item) throw new Error('درخواست سازمانی یافت نشد.');
    if (data.status) item.status = data.status;
    if (data.adminNotes !== undefined) item.adminNotes = data.adminNotes;
    return item;
  }

  // Consultations
  async createConsultation(data: any) {
    let voiceUrl = data.voiceRecordingUrl || data.voiceRecording?.dataUrl;
    if (data.voiceRecording?.dataUrl) {
      voiceUrl = await storageService.saveVoiceRecording(
        data.voiceRecording.dataUrl,
        data.voiceRecording.mimeType
      );
    }

    const now = new Date();
    const cnsId = `CNS-${Date.now().toString().slice(-4)}`;

    if (isDbConnected()) {
      try {
        const created = await prisma.consultation.create({
          data: {
            id: cnsId,
            name: data.fullName || data.contactPerson || data.name || 'کاربر گرامی',
            phone: data.phoneNumber || data.phone || '',
            email: data.email || null,
            notes: data.notes || data.description || '',
            voiceRecordingUrl: voiceUrl || null,
            voiceDuration: data.voiceDuration || data.voiceRecording?.duration ? Number(data.voiceDuration || data.voiceRecording?.duration) : null,
            status: 'new',
            adminNotes: data.adminNotes || null,
          },
        });
        return formatInquiryFromPrisma(created);
      } catch (err) {
        console.warn('Prisma createConsultation fallback:', err);
      }
    }

    const newConsultation = {
      ...data,
      id: cnsId,
      status: 'new',
      createdAt: now.toISOString(),
      createdAtFa: new Intl.DateTimeFormat('fa-IR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(now),
    };

    inMemoryConsultations.unshift(newConsultation);
    return newConsultation;
  }

  async getConsultations() {
    if (isDbConnected()) {
      try {
        const items = await prisma.consultation.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return items.map(formatInquiryFromPrisma);
      } catch (err) {
        console.warn('Prisma getConsultations fallback:', err);
      }
    }
    return inMemoryConsultations;
  }

  async updateConsultation(
    id: string,
    data: { status?: string; adminNotes?: string; assignedConsultant?: string }
  ) {
    if (isDbConnected()) {
      try {
        const updated = await prisma.consultation.update({
          where: { id },
          data: {
            status: data.status ? String(data.status).toLowerCase() : undefined,
            adminNotes: data.adminNotes !== undefined ? data.adminNotes : undefined,
          },
        });
        return formatInquiryFromPrisma(updated);
      } catch (err) {
        console.warn('Prisma updateConsultation fallback:', err);
      }
    }

    const item = inMemoryConsultations.find((i) => i.id === id);
    if (!item) throw new Error('درخواست مشاوره یافت نشد.');
    if (data.status) item.status = data.status;
    if (data.adminNotes !== undefined) item.adminNotes = data.adminNotes;
    if (data.assignedConsultant !== undefined)
      item.assignedConsultant = data.assignedConsultant;
    return item;
  }

  // Custom Gift Boxes
  async createCustomGiftBox(data: any) {
    if (data.voiceRecording?.dataUrl) {
      const voiceUrl = await storageService.saveVoiceRecording(
        data.voiceRecording.dataUrl,
        data.voiceRecording.mimeType
      );
      data.voiceRecording.dataUrl = voiceUrl;
    }

    const now = new Date();
    const newBox = {
      ...data,
      id: `CBOX-${Date.now().toString().slice(-4)}`,
      createdAt: now.toISOString(),
      createdAtFa: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' }).format(now),
    };

    inMemoryCustomGiftBoxes.unshift(newBox);
    return newBox;
  }

  async getCustomGiftBoxes() {
    return inMemoryCustomGiftBoxes;
  }

  async getCustomItemOptions() {
    if (isDbConnected()) {
      try {
        return await prisma.customItemOption.findMany({
          where: { inStock: true },
        });
      } catch (err) {
        console.warn('Prisma getCustomItemOptions fallback:', err);
      }
    }
    return [];
  }
}

export const inquiriesService = new InquiriesService();
