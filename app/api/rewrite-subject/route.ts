import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ---- Request Validation ----
const RequestSchema = z.object({
  subject: z.string().min(3),
  tone: z.string(),
  audience: z.string(),
});

// ---- Response Validation ----
const ResponseSchema = z.object({
  subjects: z.array(z.string()).min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    const prompt = `
You are a professional email subject line rewriting assistant.

STRICT CONSTRAINTS:
- Preserve the original intent.
- Do NOT add new information or assumptions.
- Improve clarity, tone, and professionalism only.
- Match the specified tone and audience.
- Output VALID JSON ONLY. No markdown. No explanations.

INPUT SUBJECT:
"""${parsed.subject}"""

SETTINGS:
Tone: ${parsed.tone}
Audience: ${parsed.audience}

OUTPUT FORMAT:
{
  "subjects": [
    "string",
    "string"
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("Empty LLM response");

    const json = JSON.parse(content);
    const validated = ResponseSchema.parse(json);

    return NextResponse.json(validated);
  } catch (error) {
    console.error("Subject rewrite error:", error);
    return NextResponse.json(
      { error: "Failed to rewrite subject" },
      { status: 500 }
    );
  }
}
