// SimpleCRM — forms-client
"use client";

import { CaptureFormWithCount } from "@/modules/forms/forms.types";
import { FormsWorkspace } from "./components/forms-workspace";

interface FormsClientProps {
  initialData: CaptureFormWithCount[];
}

export function FormsClient({ initialData }: FormsClientProps) {
  return <FormsWorkspace initialData={initialData} />;
}
