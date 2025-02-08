import { NextResponse } from "next/server";
import Groq from "groq-sdk";


const groq = new Groq({ apiKey: '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' });

export async function POST(req: Request) {
  try {
    const { extractedText } = await req.json();

    if (!extractedText) {
      return NextResponse.json({ error: "No extracted text provided." }, { status: 400 });
    }

    // Call Groq API for structured JSON conversion
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `Extract only product-related details from the given text and return them as a valid JSON object. 
      Ignore any unrelated information. Ensure the output follows this format:
      {
        "product_name": "",
        "quantity": "",
      }
      Do not include any extra text, explanations, or formatting`,
        },
        {
          role: "user",
          content: extractedText,
        },
      ],
      model: "llama-3.2-11b-vision-preview",
    });

    const structuredJson = chatCompletion.choices[0]?.message?.content?.trim() || "{}";

    return NextResponse.json({ jsonData: JSON.parse(structuredJson) });
  } catch (error) {
    console.error("Error processing with Groq:", error);
    return NextResponse.json({ error: "Failed to process data" }, { status: 500 });
  }
}
