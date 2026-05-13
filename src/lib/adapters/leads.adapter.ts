// SimpleCRM — Adapter to convert Prisma data to Figma format
import { Lead, User, LeadSource as PrismaLeadSource } from '@prisma/client';

export type LeadStatus = 'NEW' | 'NO_RESPOND' | 'CONTACTED' | 'CONVERTED' | 'LOST';

export interface FigmaLead {
  id: string;
  name: string;
  phone: string;
  location: string;
  assignedTo: string;
  status: LeadStatus;
  rating: number;
  sources: string[];
  lastContacted: Date | null;
  createdAt: Date;
  manualOrder?: number;
  customFields?: Record<string, any>;
}

export type LeadWithRelations = Lead & {
  assignedTo: User | null;
  sources: PrismaLeadSource[];
};

/**
 * Convert Prisma Lead to Figma Lead format
 */
export function adaptPrismaToFigma(prismaLead: LeadWithRelations): FigmaLead {
  return {
    id: prismaLead.id,
    name: prismaLead.name,
    phone: prismaLead.phone,
    location: prismaLead.location || '',
    assignedTo: prismaLead.assignedTo?.name || '',
    status: prismaLead.status as any,
    rating: prismaLead.rating,
    sources: prismaLead.sources.map(s => s.source),
    lastContacted: prismaLead.lastContacted,
    createdAt: prismaLead.createdAt,
  };
}

/**
 * Convert array of Prisma leads to Figma format
 */
export function adaptPrismaLeadsToFigma(prismaLeads: LeadWithRelations[]): FigmaLead[] {
  return prismaLeads.map(adaptPrismaToFigma);
}
