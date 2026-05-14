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

  const fieldsData = (form.fields as any) || { items: [] };
  const formFields = fieldsData.items || [];

  // Intelligent mapping: Map dynamic IDs to Lead properties
  let name = "Anonymous Lead";
  let phone = "";
  let email: string | null = null;
  let location: string | null = null;
  const customData: Record<string, any> = {};

  formFields.forEach((field: any) => {
    const value = data[field.id];
    if (value === undefined) return;

    const label = (field.label || "").toLowerCase();
    const type = (field.type || "").toLowerCase();

    // Mapping priorities: Type first, then Label
    if (type === 'tel' || label.includes('phone') || label.includes('téléphone') || label.includes('mobile')) {
      if (!phone) phone = value;
      else customData[field.label] = value;
    } else if (type === 'email' || label.includes('email') || label.includes('courriel')) {
      if (!email) email = value;
      else customData[field.label] = value;
    } else if (label === 'name' || label === 'full name' || label === 'fullname' || label.includes('nom') || label.includes('prénom')) {
      if (name === "Anonymous Lead") name = value;
      else customData[field.label] = value;
    } else if (label.includes('location') || label.includes('adresse') || label.includes('ville') || label.includes('localisation')) {
      if (!location) location = value;
      else customData[field.label] = value;
    } else {
      customData[field.label || field.id] = value;
    }
  });

  // Handle any leftover data not in formFields (though schema should catch this)
  Object.entries(data).forEach(([key, value]) => {
    const isMapped = formFields.some((f: any) => f.id === key);
    if (!isMapped) {
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
