import { NextResponse, type NextRequest } from "next/server";
import Papa from "papaparse";
import { getSession } from "@/lib/session";
import { importRowSchema } from "@/modules/leads/leads.schema";
import { importLeads } from "@/modules/leads/leads-bulk.service";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const text = await (file as File).text();

  const { data: rawRows, errors } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    return NextResponse.json(
      { error: "CSV parse error", details: errors.map((e) => e.message) },
      { status: 400 }
    );
  }

  // Validate + normalize rows
  const validRows = [];
  const rowErrors: { row: number; message: string }[] = [];

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    const parsed = importRowSchema.safeParse({
      name: row["name"] ?? row["Name"],
      phone: row["phone"] ?? row["Phone"],
      email: row["email"] ?? row["Email"] ?? "",
      notes: row["notes"] ?? row["Notes"] ?? "",
    });

    if (parsed.success) {
      validRows.push(parsed.data);
    } else {
      rowErrors.push({
        row: i + 2, // +1 for header, +1 for 1-indexed
        message: parsed.error.issues.map((e) => e.message).join("; "),
      });
    }
  }

  const result = await importLeads(validRows, session.userId);

  return NextResponse.json({
    ...result,
    errors: [...rowErrors, ...result.errors],
  });
}
