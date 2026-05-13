// SimpleCRM — Server Actions for Leads
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LeadStatus, LeadSource, Prisma } from '@prisma/client'
import { createLeadSchema, updateLeadSchema } from '@/modules/leads/leads.schema'
import { z } from 'zod'
import { getSession } from '@/lib/session'

// Type definitions
export type LeadFormData = z.infer<typeof createLeadSchema>
export type LeadUpdateData = z.infer<typeof updateLeadSchema>

/**
 * Create a new lead
 * @param data - Lead form data
 * @returns Created lead with relations
 */
export async function createLead(data: LeadFormData) {
  const validated = createLeadSchema.parse(data)
  
  const lead = await prisma.lead.create({
    data: {
      name: validated.name,
      phone: validated.phone,
      email: validated.email || null,
      location: validated.location || null,
      rating: validated.rating || 0,
      assignedToId: validated.assignedToId,
      status: (validated.status as any) || 'NEW',
      sources: validated.sources && validated.sources.length > 0
        ? {
            create: validated.sources.map(source => ({
              source: source as any,
              formId: validated.formId,
            })),
          }
        : undefined,
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      status: true,
      location: true,
      rating: true,
      assignedTo: {
        select: { id: true, name: true, avatarInitials: true },
      },
      sources: {
        select: { source: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  })
  
  revalidatePath('/leads')
  revalidatePath('/dashboard')
  return lead
}

/**
 * Update an existing lead
 * @param id - Lead ID
 * @param data - Update data
 * @returns Updated lead
 */
export async function updateLead(id: string, data: LeadUpdateData) {
  const validated = updateLeadSchema.parse(data)
  const session = await getSession()
  
  const oldLead = await prisma.lead.findUnique({
    where: { id },
    select: { status: true, rating: true },
  })
  
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(validated.name !== undefined && { name: validated.name }),
      ...(validated.phone !== undefined && { phone: validated.phone }),
      ...(validated.email !== undefined && { email: validated.email || null }),
      ...(validated.location !== undefined && { location: validated.location }),
      ...(validated.rating !== undefined && { rating: validated.rating }),
      ...(validated.status !== undefined && { status: validated.status as any }),
      ...(validated.customData !== undefined && {
        customData:
          validated.customData === null
            ? Prisma.JsonNull
            : (validated.customData as Prisma.InputJsonValue),
      }),
    },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      status: true,
      location: true,
      rating: true,
      assignedTo: {
        select: { id: true, name: true, avatarInitials: true },
      },
      sources: {
        select: { source: true },
      },
      createdAt: true,
      updatedAt: true,
    },
  })
  
  // Log status change activity
  if (validated.status && oldLead?.status !== validated.status && session) {
    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'STATUS_CHANGED',
        actorId: session.userId,
        fromValue: oldLead?.status,
        toValue: validated.status,
      },
    })
  }
  
  // Log rating change activity
  if (validated.rating !== undefined && oldLead?.rating !== validated.rating && session) {
    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'RATING_CHANGED',
        actorId: session.userId,
        fromValue: oldLead?.rating?.toString(),
        toValue: validated.rating.toString(),
      },
    })
  }
  
  revalidatePath('/leads')
  revalidatePath(`/leads/${id}`)
  return lead
}

/**
 * Update lead status
 * @param id - Lead ID
 * @param status - New status
 * @returns Updated lead
 */
export async function updateLeadStatus(id: string, status: LeadStatus) {
  const session = await getSession()
  const oldLead = await prisma.lead.findUnique({
    where: { id },
    select: { status: true },
  })
  
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      status,
      lastContacted: new Date(),
    },
    select: {
      id: true,
      name: true,
      status: true,
      updatedAt: true,
    },
  })
  
  // Create activity log
  if (session) {
    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'STATUS_CHANGED',
        actorId: session.userId,
        fromValue: oldLead?.status,
        toValue: status,
      },
    })
  }
  
  revalidatePath('/leads')
  revalidatePath(`/leads/${id}`)
  return lead
}

/**
 * Delete a lead
 * @param id - Lead ID
 */
export async function deleteLead(id: string) {
  await prisma.lead.delete({
    where: { id },
  })
  
  revalidatePath('/leads')
  revalidatePath('/dashboard')
}

/**
 * Delete multiple leads
 * @param ids - Array of Lead IDs
 */
export async function deleteLeads(ids: string[]) {
  await prisma.lead.deleteMany({
    where: { id: { in: ids } },
  })
  
  revalidatePath('/leads')
  revalidatePath('/dashboard')
}

/**
 * Assign lead to a user
 * @param id - Lead ID
 * @param assignedToId - User ID to assign to
 * @returns Updated lead
 */
export async function assignLead(id: string, assignedToId: string) {
  const session = await getSession()
  const lead = await prisma.lead.update({
    where: { id },
    data: { assignedToId },
    select: {
      id: true,
      name: true,
      assignedTo: {
        select: { id: true, name: true, avatarInitials: true },
      },
    },
  })
  
  // Create activity log
  if (session) {
    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'ASSIGNED',
        actorId: session.userId,
        toValue: assignedToId,
      },
    })
  }
  
  revalidatePath('/leads')
  revalidatePath(`/leads/${id}`)
  return lead
}

/**
 * Log contact with lead
 * @param id - Lead ID
 * @returns Updated lead
 */
export async function logContact(id: string) {
  const session = await getSession()
  const lead = await prisma.lead.update({
    where: { id },
    data: { lastContacted: new Date() },
    select: {
      id: true,
      name: true,
      lastContacted: true,
    },
  })
  
  // Create activity log
  if (session) {
    await prisma.activityLog.create({
      data: {
        leadId: id,
        action: 'CONTACTED',
        actorId: session.userId,
      },
    })
  }
  
  revalidatePath('/leads')
  revalidatePath(`/leads/${id}`)
  return lead
}
