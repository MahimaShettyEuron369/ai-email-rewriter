import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

// ---- Request Validation ----
const RequestSchema = z.object({
  emailText: z.string().min(10),
  purpose: z.string(),
  tone: z.string(),
  length: z.string(),
  audience: z.string(),
});

// ---- Response Validation ----
const ResponseSchema = z.object({
  rewrites: z.array(
    z.object({
      email: z.string(),
      explanation: z.string(),
    })
  ).length(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    const prompt = `
You are a professional email rewriting assistant.

STRICT CONSTRAINTS:
- Preserve the original intent exactly.
- Do NOT add new facts, assumptions, or promises.
- Improve grammar, clarity, and tone only.
- Match the specified audience and tone.
- Output VALID JSON ONLY. No markdown. No commentary.
- Avoid language that sounds defensive, confrontational, or accusatory, especially when addressing managers.
- When the audience is a manager, avoid language that sounds defensive, resistant, or like workload justification.
- Frame requests as alignment and clarification, not negotiation or pushback.


INPUT EMAIL:
"""${parsed.emailText}"""

SETTINGS:
Purpose: ${parsed.purpose}
Tone: ${parsed.tone}
Length: ${parsed.length}
Audience: ${parsed.audience}

OUTPUT FORMAT:
{
  "rewrites": [
    {
      "email": "string",
      "explanation": "brief explanation of changes"
    },
    {
      "email": "string",
      "explanation": "brief explanation of changes"
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty LLM response");
    }

    const json = JSON.parse(content);
    const validated = ResponseSchema.parse(json);

    return NextResponse.json(validated);
  } catch (error: any) {
    console.error("Rewrite error:", error);

    return NextResponse.json(
      { error: "Failed to rewrite email" },
      { status: 500 }
    );
  }
}
