import {
  GoogleGenAI,
  Type,
} from "@google/genai";
import {
  NextResponse,
} from "next/server";

import type {
  QuickMateAiResponse,
  QuickMateApiRequest,
  QuickMateConversationMessage,
} from "@/types/quickMate";

export const runtime =
  "nodejs";

export const dynamic =
  "force-dynamic";

export const maxDuration =
  30;

const MAX_MESSAGE_LENGTH =
  800;

const MAX_PRODUCTS =
  100;

const MAX_HISTORY_MESSAGES =
  10;

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY is missing. Add it to apps/web/.env.local and restart the server.",
        },
        {
          status: 503,
        }
      );
    }

    const body =
      (await request.json()) as Partial<QuickMateApiRequest>;

    const message =
      body.message?.trim();

    if (!message) {
      return NextResponse.json(
        {
          error:
            "Please enter a message.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      message.length >
      MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Your request is too long.",
        },
        {
          status: 400,
        }
      );
    }

    const products =
      Array.isArray(
        body.products
      )
        ? body.products
            .filter(
              (product) =>
                product &&
                typeof product.id ===
                  "number" &&
                typeof product.name ===
                  "string" &&
                product.name.trim()
            )
            .slice(
              0,
              MAX_PRODUCTS
            )
        : [];

    if (
      products.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "No Quickify products are available.",
        },
        {
          status: 400,
        }
      );
    }

    const history =
      sanitizeHistory(
        body.history
      );

    const ai =
      new GoogleGenAI({
        apiKey,
      });

    const response =
      await ai.models.generateContent({
        model:
          "gemini-flash-latest",

        contents:
          buildPrompt(
            message,
            products,
            history
          ),

        config: {
          temperature: 0.2,

          maxOutputTokens:
            2400,

          responseMimeType:
            "application/json",

          responseSchema: {
            type:
              Type.OBJECT,

            properties: {
              reply: {
                type:
                  Type.STRING,
              },

              planTitle: {
                type:
                  Type.STRING,
              },

              planSummary: {
                type:
                  Type.STRING,
              },

              requestedItems: {
                type:
                  Type.ARRAY,

                items: {
                  type:
                    Type.OBJECT,

                  properties: {
                    name: {
                      type:
                        Type.STRING,
                    },

                    quantity: {
                      type:
                        Type.INTEGER,
                    },

                    reason: {
                      type:
                        Type.STRING,
                    },

                    optional: {
                      type:
                        Type.BOOLEAN,
                    },
                  },

                  required: [
                    "name",
                    "quantity",
                    "reason",
                    "optional",
                  ],
                },
              },

              followUpQuestion: {
                type:
                  Type.STRING,
              },

              followUpSuggestions: {
                type:
                  Type.ARRAY,

                items: {
                  type:
                    Type.STRING,
                },
              },
            },

            required: [
              "reply",
              "planTitle",
              "planSummary",
              "requestedItems",
              "followUpQuestion",
              "followUpSuggestions",
            ],
          },
        },
      });

    const responseText =
      response.text?.trim();

    if (!responseText) {
      console.error(
        "QuickMate empty Gemini response:",
        response
      );

      throw new Error(
        "Gemini returned an empty response."
      );
    }

    const parsed =
      parseGeminiJson(
        responseText
      );

    return NextResponse.json(
      sanitizeResponse(
        parsed
      )
    );
  } catch (error) {
    const rawError =
      getErrorMessage(
        error
      );

    console.error(
      "QuickMate API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          getFriendlyError(
            rawError
          ),

        ...(process.env.NODE_ENV ===
        "development"
          ? {
              details:
                rawError,
            }
          : {}),
      },
      {
        status:
          getErrorStatus(
            rawError
          ),
      }
    );
  }
}

function sanitizeHistory(
  history:
    | QuickMateConversationMessage[]
    | undefined
) {
  if (
    !Array.isArray(
      history
    )
  ) {
    return [];
  }

  return history
    .filter(
      (message) =>
        message &&
        (message.role ===
          "user" ||
          message.role ===
            "assistant") &&
        typeof message.text ===
          "string" &&
        message.text.trim()
    )
    .slice(
      -MAX_HISTORY_MESSAGES
    )
    .map(
      (message) => ({
        role:
          message.role,

        text:
          message.text
            .trim()
            .slice(
              0,
              800
            ),
      })
    );
}

function buildPrompt(
  message: string,
  products:
    QuickMateApiRequest["products"],
  history:
    QuickMateConversationMessage[]
) {
  const catalogue =
    products
      .map(
        (product) =>
          [
            product.name,
            product.category,
            product.unit,
            `₹${product.price}`,
            `stock:${product.stock}`,
          ].join(" | ")
      )
      .join("\n");

  const conversation =
    history.length > 0
      ? history
          .map(
            (
              item,
              index
            ) =>
              `${index + 1}. ${
                item.role ===
                "user"
                  ? "USER"
                  : "QUICKMATE"
              }: ${item.text}`
          )
          .join("\n")
      : "No previous conversation.";

  return `
You are QuickMate, the AI shopping companion inside Quickify, an Indian grocery app.

RECENT CONVERSATION:
${conversation}

CURRENT USER MESSAGE:
${message}

AVAILABLE QUICKIFY PRODUCTS:
${catalogue}

Your task:
- Understand the current message using the recent conversation.
- Users may refine an earlier request using short instructions such as:
  "make it cheaper",
  "remove milk",
  "make it vegetarian",
  "for 8 people",
  "only include essentials",
  or "I already have rice".
- When refining an earlier plan, return the complete updated shopping plan, not only the changed items.
- If the user starts a new topic, create a new plan for the new request.
- Respect budgets, servings, dietary preferences, allergies, excluded ingredients and items the user already owns.
- Return at most 12 grocery requirements.
- Use short, searchable ingredient or grocery names.
- Quantity means the number of catalogue packs to add.
- Quantity must be a whole number between 1 and 10.
- Do not invent product IDs.
- Do not invent exact prices or stock.
- Do not promise that a specific catalogue item is available.
- Keep the reply and summary concise and conversational.
- followUpSuggestions must contain 2 to 4 short actions the user could naturally send next.
- Good follow-up examples include:
  "Make it cheaper",
  "Remove optional items",
  "Plan it for 6 people",
  "Make it vegetarian",
  "Suggest alternatives".
- Do not repeat irrelevant suggestions.
- If clarification is necessary, put one concise question in followUpQuestion.
- Otherwise use an empty string for followUpQuestion.
- Return only valid JSON.
- Do not wrap JSON in Markdown code fences.
`;
}

function parseGeminiJson(
  rawResponse: string
): QuickMateAiResponse {
  const cleanedResponse =
    cleanGeminiJson(
      rawResponse
    );

  try {
    return JSON.parse(
      cleanedResponse
    ) as QuickMateAiResponse;
  } catch (error) {
    console.error(
      "QuickMate invalid JSON response:",
      rawResponse
    );

    console.error(
      "QuickMate cleaned JSON response:",
      cleanedResponse
    );

    console.error(
      "QuickMate JSON parsing error:",
      error
    );

    throw new Error(
      "Gemini returned invalid JSON."
    );
  }
}

function cleanGeminiJson(
  rawResponse: string
) {
  let cleaned =
    rawResponse.trim();

  cleaned = cleaned
    .replace(
      /^```(?:json)?\s*/i,
      ""
    )
    .replace(
      /\s*```$/,
      ""
    )
    .trim();

  const firstBrace =
    cleaned.indexOf(
      "{"
    );

  const lastBrace =
    cleaned.lastIndexOf(
      "}"
    );

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace >
      firstBrace
  ) {
    cleaned =
      cleaned.slice(
        firstBrace,
        lastBrace + 1
      );
  }

  return cleaned.trim();
}

function sanitizeResponse(
  response: QuickMateAiResponse
): QuickMateAiResponse {
  const requestedItems =
    Array.isArray(
      response.requestedItems
    )
      ? response.requestedItems
          .slice(0, 12)
          .map(
            (item) => ({
              name:
                String(
                  item.name ??
                    ""
                ).trim(),

              quantity:
                Math.min(
                  10,
                  Math.max(
                    1,
                    Math.round(
                      Number(
                        item.quantity
                      ) || 1
                    )
                  )
                ),

              reason:
                String(
                  item.reason ??
                    ""
                ).trim(),

              optional:
                Boolean(
                  item.optional
                ),
            })
          )
          .filter(
            (item) =>
              item.name.length >
              0
          )
      : [];

  const followUpQuestion =
    String(
      response.followUpQuestion ??
        ""
    ).trim();

  const followUpSuggestions =
    Array.isArray(
      response.followUpSuggestions
    )
      ? response.followUpSuggestions
          .map(
            (suggestion) =>
              String(
                suggestion
              ).trim()
          )
          .filter(Boolean)
          .slice(0, 4)
      : [];

  return {
    reply:
      String(
        response.reply ??
          "I prepared a shopping plan for you."
      ).trim(),

    planTitle:
      String(
        response.planTitle ??
          "QuickMate Plan"
      ).trim(),

    planSummary:
      String(
        response.planSummary ??
          ""
      ).trim(),

    requestedItems,

    followUpQuestion:
      followUpQuestion ||
      null,

    followUpSuggestions:
      followUpSuggestions.length >
      0
        ? followUpSuggestions
        : [
            "Remove optional items",
            "Make it cheaper",
          ],
  };
}

function getErrorMessage(
  error: unknown
) {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error ===
    "string"
  ) {
    return error;
  }

  try {
    return JSON.stringify(
      error
    );
  } catch {
    return "Unknown Gemini error";
  }
}

function getFriendlyError(
  message: string
) {
  const normalized =
    message.toLowerCase();

  if (
    normalized.includes(
      "api key"
    ) ||
    normalized.includes(
      "api_key"
    ) ||
    normalized.includes(
      "unauthenticated"
    ) ||
    normalized.includes(
      "permission denied"
    )
  ) {
    return "The QuickMate API key is invalid or unavailable.";
  }

  if (
    normalized.includes(
      "quota"
    ) ||
    normalized.includes(
      "resource_exhausted"
    ) ||
    normalized.includes(
      "rate limit"
    ) ||
    normalized.includes(
      "429"
    )
  ) {
    return "QuickMate has reached its current usage limit. Please try again later.";
  }

  if (
    normalized.includes(
      "not found"
    ) ||
    normalized.includes(
      "404"
    )
  ) {
    return "The configured QuickMate model is unavailable.";
  }

  if (
    normalized.includes(
      "timeout"
    ) ||
    normalized.includes(
      "deadline"
    ) ||
    normalized.includes(
      "fetch failed"
    )
  ) {
    return "QuickMate took too long to respond. Please try again.";
  }

  return "QuickMate could not prepare a plan right now.";
}

function getErrorStatus(
  message: string
) {
  const normalized =
    message.toLowerCase();

  if (
    normalized.includes(
      "quota"
    ) ||
    normalized.includes(
      "429"
    )
  ) {
    return 429;
  }

  if (
    normalized.includes(
      "api key"
    ) ||
    normalized.includes(
      "unauthenticated"
    )
  ) {
    return 401;
  }

  return 500;
}