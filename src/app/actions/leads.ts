// SimpleCRM — Server Actions for Leads
'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LeadStatus } from '@prisma/client'
import { createLeadSchema, updateLeadSchema } from '@/modules/leads/leads.schema'
import { createLead as createLeadService } from '@/modules/leads/leads.service'
import { updateLead as updateLeadService } from '@/modules/leads/leads-mutations.service'
import { z } from 'zod'
import { getSession } from '@/lib/session'

// Type definitions
export type LeadFormData = z.input<typeof createLeadSchema>
export type LeadUpdateData = z.infer<typeof updateLeadSchema>

/**
 * Create a new lead
 * @param data - Lead form data
 * @returns Created lead with relations
 */
export async function createLead(data: LeadFormData) {
  const validated = createLeadSchema.parse(data)
  const session = await getSession()

  const lead = await createLeadService(validated, session?.userId ?? '')

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

  const lead = await updateLeadService(id, validated)

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
  const lead = await updateLeadService(id, {
    status,
    lastContacted: new Date().toISOString(),
  })

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
