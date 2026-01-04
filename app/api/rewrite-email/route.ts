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
  mode: z.enum(["rewrite", "grammar"]), 
});

// ---- Response Validation ----
const ResponseSchema = z.object({
  rewrites: z
    .array(
      z.object({
        email: z.string(),
        explanation: z.string(),
      })
    )
    .min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RequestSchema.parse(body);

    const isGrammar = parsed.mode === "grammar";
    

    // Construct prompt for model
    const prompt = isGrammar
      ? `
You are a grammar correction assistant.

STRICT RULES:
- Fix grammar, spelling, punctuation only.
- Do NOT rephrase sentences.
- Preserve sentence structure exactly.
- Output VALID JSON ONLY.
- No explanations, no markdown.
- Generate exactly 2 rewritten versions.
- Each version must be a complete email.
- Do not return fewer or more than 2 items in the rewrites array.
- Both versions must differ in word choice while adhering to the above rules.

INPUT EMAIL:
"""${parsed.emailText}"""


OUTPUT FORMAT:
{
  "rewrites": [
    {
      "email": "corrected email text",
      "explanation": "explanation of changes"
    },
    {
      "email": "corrected email text",
      "explanation": "explanation of changes"
    }
  ]
}
`
      : `
You are a professional email rewriting assistant.

STRICT CONSTRAINTS:
- Preserve the original intent exactly.
- Do NOT add new facts, assumptions, or promises.
- Improve grammar, clarity, and tone only.
- Match the specified audience and tone.
- Output VALID JSON ONLY. No markdown or commentary.
- Avoid language that sounds defensive, confrontational, or accusatory, especially when addressing managers.
- Frame requests as alignment and clarification, not negotiation or pushback.
- Each rewritten version must be a complete email including greeting, body, and closing/signature.
- All newline characters inside strings MUST be escaped as \\n

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
      "email": "full mail body including greeting, body, and closing/signature",
      "explanation": "brief explanation of changes"
    },
    {
      "email": "full mail body including greeting, body, and closing/signature",
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

    console.log("RAW LLM OUTPUT:", content);
    // const json = JSON.parse(content);

    let json;

    try {
      json = JSON.parse(content);
    } catch {
      // Attempt recovery by extracting first JSON block
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) {
        throw new Error("No JSON object found in LLM response");
      }
      json = JSON.parse(match[0]);
    }

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
