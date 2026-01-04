import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const { rows } = await query(`
    SELECT
      id,
      rewritten_email,
      tone,
      length,
      created_at
    FROM email_versions
    ORDER BY created_at DESC
    LIMIT 10
  `);

  return NextResponse.json(rows);
}
