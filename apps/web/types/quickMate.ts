import type {
  Product,
} from "@/types/product";

export type QuickMateRole =
  | "user"
  | "assistant";

export type QuickMateMessage = {
  id: string;
  role: QuickMateRole;
  text: string;
  createdAt: string;
  suggestions?: string[];
};

export type QuickMateConversationMessage = {
  role: QuickMateRole;
  text: string;
};

export type QuickMateRequestedItem = {
  name: string;
  quantity: number;
  reason: string;
  optional: boolean;
};

export type QuickMatePlanItem = {
  ingredient: string;
  requestedQuantity: number;
  reason: string;
  optional: boolean;
  product: Product;
  cartQuantity: number;
  selected: boolean;
};

export type QuickMateMissingItem = {
  ingredient: string;
  reason: string;
  optional: boolean;
};

export type QuickMatePlan = {
  id: string;
  title: string;
  summary: string;
  estimatedTotal: number;
  items: QuickMatePlanItem[];
  missingItems: QuickMateMissingItem[];
  followUpQuestion: string | null;
};

export type QuickMateApiProduct = {
  id: number;
  name: string;
  category: string;
  description: string;
  unit: string;
  price: number;
  mrp: number;
  stock: number;
  image: string;
};

export type QuickMateApiRequest = {
  message: string;
  products: QuickMateApiProduct[];
  history?: QuickMateConversationMessage[];
};

export type QuickMateAiResponse = {
  reply: string;
  planTitle: string;
  planSummary: string;
  requestedItems: QuickMateRequestedItem[];
  followUpQuestion: string | null;
  followUpSuggestions: string[];
};