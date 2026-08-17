import { openai } from "@ai-sdk/openai";
import { defineAgent } from "eve";

const modelId = process.env.EVE_MODEL ?? "gpt-4o-mini";

export default defineAgent({
  model: openai(modelId),
});
