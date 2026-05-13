// SimpleCRM — Type Safety Utilities for Prisma
// Ensures Prisma types match component props

import { Lead, User, LeadSource, ActivityLog, Note, Reminder } from '@prisma/client'

/**
 * Lead with assigned user relation
 */
export type LeadWithUser = Lead & {
  assignedTo: User | null
}

/**
 * Lead with all relations
 */
export type LeadWithRelations = Lead & {
  assignedTo: User | null
  sources: Array<{ source: LeadSource }>
  notes: Note[]
  reminders: Reminder[]
  activityLogs: ActivityLog[]
}

/**
 * Lead with minimal relations for list views
 */
export type LeadListItem = Lead & {
  assignedTo: User | null
  sources: Array<{ source: LeadSource }>
}

/**
 * User with stats
 */
export type UserWithStats = User & {
  _count: {
    assignedLeads: number
  }
}

/**
 * Activity log with actor
 */
export type ActivityWithActor = ActivityLog & {
  actor: User | null
}

/**
 * Type guard to check if lead has assigned user
 */
export function hasAssignedUser(lead: LeadWithUser): lead is LeadWithUser & { assignedTo: User } {
  return lead.assignedTo !== null
}

/**
 * Type guard to check if lead has sources
 */
export function hasSources(lead: LeadWithRelations): lead is LeadWithRelations & { sources: Array<{ source: LeadSource }> } {
  return Array.isArray(lead.sources) && lead.sources.length > 0
}

/**
 * Type guard to check if value is not null/undefined
 */
export function isNotNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}
