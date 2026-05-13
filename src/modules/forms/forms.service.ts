// SimpleCRM — forms.service.ts
import { prisma } from "@/lib/prisma";
import { CaptureForm, LeadStatus, ActivityAction, Prisma } from "@prisma/client";
import { CreateFormInput, UpdateFormInput, SubmitFormInput } from "./forms.schema";
import { CaptureFormWithCount, SubmissionResponse } from "./forms.types";

export async function listForms(): Promise<CaptureFormWithCount[]> {
  return prisma.captureForm.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { leadSources: true },
      },
    },
  }) as unknown as CaptureFormWithCount[];
}

export async function getFormBySlug(slug: string): Promise<CaptureForm | null> {
  return prisma.captureForm.findUnique({
    where: { slug, isActive: true },
  });
}

export async function createForm(data: CreateFormInput): Promise<CaptureForm> {
  const baseSlug = data.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.captureForm.findUnique({ where: { slug } });
    if (!existing) break;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return prisma.captureForm.create({
    data: {
      ...data,
      slug,
      fields: data.fields as Prisma.InputJsonValue,
    },
  });
}

export async function updateForm(id: string, data: UpdateFormInput): Promise<CaptureForm> {
  return prisma.captureForm.update({
    where: { id },
    data: {
      ...data,
      ...(data.fields && { fields: data.fields as Prisma.InputJsonValue }),
    },
  });
}

export async function deleteForm(id: string): Promise<void> {
  await prisma.captureForm.delete({ where: { id } });
}

export async function submitForm(slug: string, data: SubmitFormInput): Promise<SubmissionResponse> {
  const form = await prisma.captureForm.findUnique({ where: { slug, isActive: true } });
  if (!form) throw new Error("Form not found or inactive");

  const existingLead = await prisma.lead.findFirst({
    where: { phone: data.phone },
  });

  if (existingLead) {
    await prisma.leadSource.create({
      data: {
        leadId: existingLead.id,
        source: form.sourceTag,
        formId: form.id,
      },
    });
    return { leadId: existingLead.id, isNew: false };
  }

  return prisma.$transaction(async (tx) => {
    // Find a system actor (first admin) for logging public submissions
    const systemUser = await tx.user.findFirst({ where: { role: "ADMIN" } });

    const lead = await tx.lead.create({
      data: {
        name: data.name,
        phone: data.phone,
        location: data.location || null,
        status: LeadStatus.NEW,
        sources: {
          create: {
            source: form.sourceTag,
            formId: form.id,
          },
        },
        customData: data.message ? { Message: data.message } : {},
      },
    });

    if (systemUser) {
      await tx.activityLog.create({
        data: {
          action: ActivityAction.CREATED,
          leadId: lead.id,
          actorId: systemUser.id,
        },
      });
    }

    return { leadId: lead.id, isNew: true };
  });
}
