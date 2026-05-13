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
    .replace(/\s+/g, "-") || "form";

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.captureForm.findUnique({ where: { slug } });
    if (!existing) break;
    slug = `${baseSlug}-${counter++}`;
  }

  return prisma.captureForm.create({
    data: {
      name: data.name,
      description: data.description || "Submit your information below",
      slug: slug,
      sourceTag: data.sourceTag || "Website",
      fields: {
        items: data.fields,
        submitButtonText: data.submitButtonText || "Send Request"
      } as unknown as Prisma.InputJsonValue,
      isActive: true
    }
  });
}

export async function updateForm(id: string, data: UpdateFormInput): Promise<CaptureForm> {
  const current = await prisma.captureForm.findUnique({ where: { id } });
  if (!current) throw new Error("Form not found");

  const currentFields = (current.fields as any) || { items: [], submitButtonText: "Send Request" };

  return prisma.captureForm.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      sourceTag: data.sourceTag,
      isActive: data.isActive,
      fields: (data.fields || data.submitButtonText) ? {
        items: data.fields ?? currentFields.items,
        submitButtonText: data.submitButtonText ?? currentFields.submitButtonText
      } as unknown as Prisma.InputJsonValue : undefined,
    },
  });
}

export async function deleteForm(id: string): Promise<void> {
  await prisma.captureForm.delete({ where: { id } });
}

export async function submitForm(slug: string, data: Record<string, any>): Promise<SubmissionResponse> {
  const form = await prisma.captureForm.findUnique({ where: { slug, isActive: true } });
  if (!form) throw new Error("Form not found or inactive");

  // Identify core fields from the dynamic data
  // We look for keys like 'name', 'phone', 'email' or the labels
  const name = data.name || data.fullname || data.FullName || "Anonymous Lead";
  const phone = data.phone || data.tel || data.PhoneNumber || "";
  const email = data.email || data.Email || null;
  const location = data.location || data.Location || null;

  // Everything else goes to customData
  const customData: Record<string, any> = {};
  Object.entries(data).forEach(([key, value]) => {
    if (!['name', 'phone', 'email', 'location'].includes(key.toLowerCase())) {
      customData[key] = value;
    }
  });

  const existingLead = await prisma.lead.findFirst({
    where: { phone: phone as string },
  });

  if (existingLead && phone) {
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
    const systemUser = await tx.user.findFirst({ where: { role: "ADMIN" } });

    const lead = await tx.lead.create({
      data: {
        name: name as string,
        phone: phone as string,
        email: email as string,
        location: location as string,
        status: LeadStatus.NEW,
        sources: {
          create: {
            source: form.sourceTag,
            formId: form.id,
          },
        },
        customData: customData as Prisma.InputJsonValue,
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
