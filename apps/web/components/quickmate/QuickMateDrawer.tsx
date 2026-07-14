"use client";

import {
  type FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createPortal,
} from "react-dom";
import {
  Bot,
  ChevronRight,
  LoaderCircle,
  MessageCircleMore,
  RotateCcw,
  Send,
  Sparkles,
  User,
  WandSparkles,
  X,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import {
  useQuery,
} from "@tanstack/react-query";
import {
  toast,
} from "sonner";

import QuickMatePlanCard from "./QuickMatePlanCard";

import {
  getAllProducts,
} from "@/services/productService";
import {
  buildQuickMatePlan,
} from "@/lib/quickMateMatcher";
import {
  useQuickMateStore,
} from "@/store/quickMateStore";
import type {
  QuickMateAiResponse,
  QuickMateApiProduct,
  QuickMateConversationMessage,
  QuickMateMessage,
} from "@/types/quickMate";

const suggestedPrompts = [
  {
    emoji: "🍳",
    label: "Breakfast",
    prompt:
      "Plan a simple breakfast for 2 people.",
  },
  {
    emoji: "🎂",
    label: "Birthday",
    prompt:
      "Plan snacks and essentials for a birthday party for 8 people.",
  },
  {
    emoji: "💪",
    label: "High protein",
    prompt:
      "Suggest a high-protein grocery basket for one week.",
  },
  {
    emoji: "💰",
    label: "Under ₹1000",
    prompt:
      "Plan useful weekly groceries under ₹1000.",
  },
  {
    emoji: "🍝",
    label: "Cook a dish",
    prompt:
      "Help me shop for white sauce pasta for 4 people.",
  },
  {
    emoji: "🥗",
    label: "Healthy",
    prompt:
      "Suggest a healthy vegetarian meal plan for today.",
  },
];

export default function QuickMateDrawer() {
  const [mounted, setMounted] =
    useState(false);

  const [input, setInput] =
    useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    confirmClear,
    setConfirmClear,
  ] = useState(false);

  const messageEndRef =
    useRef<HTMLDivElement>(
      null
    );

  const inputRef =
    useRef<HTMLInputElement>(
      null
    );

  const open =
    useQuickMateStore(
      (state) =>
        state.open
    );

  const messages =
    useQuickMateStore(
      (state) =>
        state.messages
    );

  const currentPlan =
    useQuickMateStore(
      (state) =>
        state.currentPlan
    );

  const closeQuickMate =
    useQuickMateStore(
      (state) =>
        state.closeQuickMate
    );

  const addMessage =
    useQuickMateStore(
      (state) =>
        state.addMessage
    );

  const setCurrentPlan =
    useQuickMateStore(
      (state) =>
        state.setCurrentPlan
    );

  const clearConversation =
    useQuickMateStore(
      (state) =>
        state.clearConversation
    );

  const {
    data: products = [],
    isLoading:
      productsLoading,
  } = useQuery({
    queryKey: [
      "products",
    ],
    queryFn:
      getAllProducts,
  });

  const latestSuggestions =
    useMemo(() => {
      for (
        let index =
          messages.length - 1;
        index >= 0;
        index -= 1
      ) {
        const message =
          messages[index];

        if (
          message?.role ===
            "assistant" &&
          message.suggestions &&
          message.suggestions.length >
            0
        ) {
          return message.suggestions;
        }
      }

      return [];
    }, [messages]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setConfirmClear(
        false
      );

      return;
    }

    const scrollY =
      window.scrollY;

    const previousHtmlOverflow =
      document.documentElement.style
        .overflow;

    const previousBodyPosition =
      document.body.style
        .position;

    const previousBodyTop =
      document.body.style.top;

    const previousBodyLeft =
      document.body.style.left;

    const previousBodyRight =
      document.body.style.right;

    const previousBodyWidth =
      document.body.style.width;

    document.documentElement.style.overflow =
      "hidden";

    document.body.style.position =
      "fixed";

    document.body.style.top =
      `-${scrollY}px`;

    document.body.style.left =
      "0";

    document.body.style.right =
      "0";

    document.body.style.width =
      "100%";

    return () => {
      document.documentElement.style.overflow =
        previousHtmlOverflow;

      document.body.style.position =
        previousBodyPosition;

      document.body.style.top =
        previousBodyTop;

      document.body.style.left =
        previousBodyLeft;

      document.body.style.right =
        previousBodyRight;

      document.body.style.width =
        previousBodyWidth;

      window.scrollTo({
        top: scrollY,
        left: 0,
        behavior: "instant",
      });
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(
      event: KeyboardEvent
    ) {
      if (
        event.key !==
        "Escape"
      ) {
        return;
      }

      if (confirmClear) {
        setConfirmClear(
          false
        );

        return;
      }

      closeQuickMate();
    }

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    open,
    confirmClear,
    closeQuickMate,
  ]);

  useEffect(() => {
    if (!open) {
      return;
    }

    messageEndRef.current?.scrollIntoView(
      {
        behavior:
          "smooth",
        block: "end",
      }
    );
  }, [
    open,
    messages,
    currentPlan,
    submitting,
  ]);

  async function submitPrompt(
    rawPrompt: string
  ) {
    const prompt =
      rawPrompt.trim();

    if (
      !prompt ||
      submitting
    ) {
      return;
    }

    if (
      products.length ===
      0
    ) {
      toast.error(
        productsLoading
          ? "Products are still loading"
          : "No products available"
      );

      return;
    }

    const history:
      QuickMateConversationMessage[] =
      messages
        .filter(
          (message) =>
            message.id !==
            "quickmate-welcome"
        )
        .slice(-10)
        .map(
          (message) => ({
            role:
              message.role,

            text:
              message.text,
          })
        );

    const userMessage:
      QuickMateMessage = {
      id:
        crypto.randomUUID(),

      role: "user",

      text:
        prompt,

      createdAt:
        new Date().toISOString(),
    };

    addMessage(
      userMessage
    );

    setCurrentPlan(
      null
    );

    setInput("");

    setSubmitting(
      true
    );

    try {
      const apiProducts:
        QuickMateApiProduct[] =
        products.map(
          (product) => ({
            id:
              product.id,

            name:
              product.name,

            category:
              product.category,

            description:
              product.description,

            unit:
              product.unit,

            price:
              product.price,

            mrp:
              product.mrp,

            stock:
              product.stock,

            image:
              product.image,
          })
        );

      const response =
        await fetch(
          "/api/quickmate",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                message:
                  prompt,

                products:
                  apiProducts,

                history,
              }),
          }
        );

      const result =
        (await response.json()) as
          | QuickMateAiResponse
          | {
              error?: string;
              details?: string;
            };

      if (!response.ok) {
        const publicMessage =
          "error" in result &&
          result.error
            ? result.error
            : "QuickMate could not respond";

        if (
          "details" in result &&
          result.details
        ) {
          console.error(
            "QuickMate provider details:",
            result.details
          );
        }

        throw new Error(
          publicMessage
        );
      }

      const aiResponse =
        result as QuickMateAiResponse;

      addMessage({
        id:
          crypto.randomUUID(),

        role:
          "assistant",

        text:
          aiResponse.reply,

        createdAt:
          new Date().toISOString(),

        suggestions:
          aiResponse.followUpSuggestions,
      });

      const plan =
        buildQuickMatePlan(
          aiResponse,
          products
        );

      if (
        plan.items.length >
          0 ||
        plan.missingItems.length >
          0
      ) {
        setCurrentPlan(
          plan
        );
      }
    } catch (error) {
      console.error(
        "QuickMate request failed:",
        error
      );

      addMessage({
        id:
          crypto.randomUUID(),

        role:
          "assistant",

        text:
          error instanceof
          Error
            ? error.message
            : "I could not prepare a shopping plan right now. Please try again.",

        createdAt:
          new Date().toISOString(),

        suggestions: [
          "Try again",
          "Plan a simple breakfast",
        ],
      });

      toast.error(
        "QuickMate could not respond"
      );
    } finally {
      setSubmitting(
        false
      );

      window.setTimeout(
        () => {
          inputRef.current?.focus();
        },
        100
      );
    }
  }

  function handleSubmit(
    event: FormEvent
  ) {
    event.preventDefault();

    void submitPrompt(
      input
    );
  }

  function handleConfirmClear() {
    clearConversation();

    setInput("");

    setConfirmClear(
      false
    );

    toast.success(
      "New conversation started"
    );

    window.setTimeout(
      () => {
        inputRef.current?.focus();
      },
      100
    );
  }

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="quickmate-overlay"
            type="button"
            aria-label="Close QuickMate"
            onClick={
              closeQuickMate
            }
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
            }}
            className="fixed inset-0 z-[9990] cursor-default bg-slate-950/45 backdrop-blur-[8px]"
          />

          <motion.aside
            key="quickmate-drawer"
            initial={{
              x: "100%",
              opacity: 0.94,
            }}
            animate={{
              x: 0,
              opacity: 1,
            }}
            exit={{
              x: "100%",
              opacity: 0.94,
            }}
            transition={{
              type: "spring",
              stiffness: 310,
              damping: 32,
              mass: 0.9,
            }}
            role="dialog"
            aria-modal="true"
            aria-label="QuickMate AI shopping companion"
            className="fixed inset-y-0 right-0 z-[9991] flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50 shadow-[-22px_0_60px_rgba(15,23,42,0.24)] sm:w-[440px]"
            onMouseDown={(
              event
            ) => {
              event.stopPropagation();
            }}
          >
            <header className="relative shrink-0 overflow-hidden border-b border-white/30 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 px-4 pb-4 pt-[max(16px,env(safe-area-inset-top))] text-white">
              <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/15 blur-3xl" />

              <div className="relative flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [
                        0,
                        -5,
                        5,
                        0,
                      ],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat:
                        Infinity,
                      repeatDelay: 2,
                    }}
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-lg backdrop-blur"
                  >
                    <Sparkles
                      size={23}
                    />
                  </motion.div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black">
                        QuickMate
                      </h2>

                      <span className="rounded-full border border-white/20 bg-white/15 px-2 py-0.5 text-[8px] font-black uppercase tracking-wide">
                        AI
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-white/75">
                      Your smart shopping companion
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setConfirmClear(
                        true
                      )
                    }
                    disabled={
                      submitting
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white disabled:opacity-40"
                    aria-label="Start new QuickMate conversation"
                    title="New conversation"
                  >
                    <RotateCcw
                      size={17}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={
                      closeQuickMate
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                    aria-label="Close QuickMate"
                  >
                    <ChevronRight
                      size={21}
                    />
                  </button>
                </div>
              </div>

              <div className="relative mt-4 flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                <WandSparkles
                  size={15}
                  className="shrink-0 text-green-100"
                />

                <p className="text-[10px] font-semibold leading-4 text-white/80">
                  Ask about meals, budgets, parties,
                  nutrition or groceries.
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto overscroll-contain px-3 py-4">
              <div className="space-y-4">
                {messages.map(
                  (message) => (
                    <ChatMessage
                      key={
                        message.id
                      }
                      message={
                        message
                      }
                    />
                  )
                )}

                {messages.length <=
                  1 &&
                  !submitting && (
                    <div>
                      <p className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                        Try asking
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {suggestedPrompts.map(
                          (suggestion) => (
                            <button
                              key={
                                suggestion.label
                              }
                              type="button"
                              onClick={() =>
                                void submitPrompt(
                                  suggestion.prompt
                                )
                              }
                              className="rounded-2xl border border-gray-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-green-200 hover:shadow-md"
                            >
                              <span className="text-xl">
                                {suggestion.emoji}
                              </span>

                              <p className="mt-2 text-xs font-black text-gray-900">
                                {suggestion.label}
                              </p>

                              <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-gray-400">
                                {suggestion.prompt}
                              </p>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}

                {submitting && (
                  <TypingIndicator />
                )}

                {currentPlan &&
                  !submitting && (
                    <QuickMatePlanCard
                      plan={
                        currentPlan
                      }
                      onClose={
                        closeQuickMate
                      }
                    />
                  )}

                {!submitting &&
                  messages.length >
                    1 &&
                  latestSuggestions.length >
                    0 && (
                    <FollowUpSuggestions
                      suggestions={
                        latestSuggestions
                      }
                      onSelect={(
                        suggestion
                      ) =>
                        void submitPrompt(
                          suggestion
                        )
                      }
                    />
                  )}

                <div
                  ref={
                    messageEndRef
                  }
                />
              </div>
            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="shrink-0 border-t border-gray-100 bg-white/95 px-3 pt-3 backdrop-blur-xl"
              style={{
                paddingBottom:
                  "max(12px, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 transition focus-within:border-green-400 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(22,163,74,0.08)]">
                <input
                  ref={
                    inputRef
                  }
                  value={
                    input
                  }
                  disabled={
                    submitting
                  }
                  onChange={(
                    event
                  ) =>
                    setInput(
                      event.target.value
                    )
                  }
                  placeholder="Ask QuickMate..."
                  autoComplete="off"
                  enterKeyHint="send"
                  maxLength={800}
                  className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                />

                <motion.button
                  type="submit"
                  whileTap={{
                    scale: 0.92,
                  }}
                  disabled={
                    submitting ||
                    !input.trim()
                  }
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  aria-label="Send message"
                >
                  {submitting ? (
                    <LoaderCircle
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Send
                      size={17}
                    />
                  )}
                </motion.button>
              </div>

              <p className="mt-2 text-center text-[9px] text-gray-400">
                QuickMate can make mistakes. Check
                items before adding them.
              </p>
            </form>

            <AnimatePresence>
              {confirmClear && (
                <ClearConversationDialog
                  onCancel={() =>
                    setConfirmClear(
                      false
                    )
                  }
                  onConfirm={
                    handleConfirmClear
                  }
                />
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

function ChatMessage({
  message,
}: {
  message:
    QuickMateMessage;
}) {
  const assistant =
    message.role ===
    "assistant";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`flex items-end gap-2 ${
        assistant
          ? "justify-start"
          : "justify-end"
      }`}
    >
      {assistant && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-sm">
          <Bot
            size={14}
          />
        </span>
      )}

      <div
        className={`max-w-[82%] whitespace-pre-line rounded-2xl px-3 py-2.5 text-xs leading-5 shadow-sm ${
          assistant
            ? "rounded-bl-md border border-gray-100 bg-white text-gray-700"
            : "rounded-br-md bg-green-600 text-white"
        }`}
      >
        {message.text}
      </div>

      {!assistant && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gray-200 text-gray-600">
          <User
            size={14}
          />
        </span>
      )}
    </motion.div>
  );
}

function FollowUpSuggestions({
  suggestions,
  onSelect,
}: {
  suggestions: string[];
  onSelect: (
    suggestion: string
  ) => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-green-100 bg-green-50/70 p-3"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wide text-green-700">
        <MessageCircleMore
          size={13}
        />
        Continue with
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map(
          (suggestion) => (
            <button
              key={
                suggestion
              }
              type="button"
              onClick={() =>
                onSelect(
                  suggestion
                )
              }
              className="rounded-full border border-green-200 bg-white px-3 py-2 text-[10px] font-bold text-green-700 shadow-sm transition hover:border-green-300 hover:bg-green-100 active:scale-95"
            >
              {suggestion}
            </button>
          )
        )}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white">
        <Bot
          size={14}
        />
      </span>

      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
        {[0, 1, 2].map(
          (index) => (
            <motion.span
              key={index}
              animate={{
                y: [
                  0,
                  -4,
                  0,
                ],
              }}
              transition={{
                duration: 0.7,
                repeat:
                  Infinity,
                delay:
                  index *
                  0.14,
              }}
              className="h-1.5 w-1.5 rounded-full bg-green-500"
            />
          )
        )}
      </div>
    </div>
  );
}

function ClearConversationDialog({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
      }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-5 backdrop-blur-sm"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onCancel();
        }
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.94,
          y: 12,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.94,
          y: 12,
        }}
        className="w-full max-w-sm rounded-3xl border border-white/60 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-100 text-green-700">
            <RotateCcw
              size={19}
            />
          </div>

          <button
            type="button"
            onClick={
              onCancel
            }
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close confirmation"
          >
            <X
              size={18}
            />
          </button>
        </div>

        <h3 className="mt-4 text-lg font-black text-gray-950">
          Start a new conversation?
        </h3>

        <p className="mt-2 text-xs leading-5 text-gray-500">
          Your current QuickMate messages and
          shopping plan will be removed from this
          device.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={
              onCancel
            }
            className="rounded-xl border border-gray-200 px-3 py-3 text-xs font-bold text-gray-700 transition hover:bg-gray-50"
          >
            Keep chat
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            className="rounded-xl bg-green-600 px-3 py-3 text-xs font-bold text-white transition hover:bg-green-700"
          >
            Start new
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}