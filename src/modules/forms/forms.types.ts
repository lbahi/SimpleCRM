// SimpleCRM — forms.types.ts
import { CaptureForm } from "@prisma/client";

export type CaptureFormWithCount = CaptureForm & {
  _count: {
    leadSources: number;
  };
};

export interface FormSubmission {
  name: string;
  phone: string;
  location?: string;
  message?: string;
}

export interface SubmissionResponse {
  leadId: string;
  isNew: boolean;
}
