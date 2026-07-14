import type {
  Product,
} from "@/types/product";
import type {
  QuickMateAiResponse,
  QuickMatePlan,
  QuickMatePlanItem,
} from "@/types/quickMate";

export function buildQuickMatePlan(
  aiResponse: QuickMateAiResponse,
  products: Product[]
): QuickMatePlan {
  const usedProductIds =
    new Set<number>();

  const items: QuickMatePlanItem[] =
    [];

  const missingItems =
    [];

  for (
    const requestedItem of
    aiResponse.requestedItems
  ) {
    const product =
      findBestProductMatch(
        requestedItem.name,
        products,
        usedProductIds
      );

    if (!product) {
      missingItems.push({
        ingredient:
          requestedItem.name,
        reason:
          requestedItem.reason,
        optional:
          requestedItem.optional,
      });

      continue;
    }

    usedProductIds.add(
      product.id
    );

    const cartQuantity =
      Math.min(
        requestedItem.quantity,
        Math.max(
          product.stock,
          1
        )
      );

    items.push({
      ingredient:
        requestedItem.name,

      requestedQuantity:
        requestedItem.quantity,

      reason:
        requestedItem.reason,

      optional:
        requestedItem.optional,

      product,

      cartQuantity,

      selected:
        product.stock > 0,
    });
  }

  const estimatedTotal =
    items.reduce(
      (total, item) =>
        item.selected
          ? total +
            item.product.price *
              item.cartQuantity
          : total,
      0
    );

  return {
    id:
      crypto.randomUUID(),

    title:
      aiResponse.planTitle ||
      "QuickMate Plan",

    summary:
      aiResponse.planSummary,

    estimatedTotal,

    items,

    missingItems,

    followUpQuestion:
      aiResponse.followUpQuestion,
  };
}

function findBestProductMatch(
  ingredient: string,
  products: Product[],
  usedProductIds: Set<number>
) {
  const queryTokens =
    tokenize(ingredient);

  if (
    queryTokens.length ===
    0
  ) {
    return null;
  }

  const candidates =
    products
      .filter(
        (product) =>
          !usedProductIds.has(
            product.id
          )
      )
      .map((product) => ({
        product,
        score:
          calculateMatchScore(
            queryTokens,
            product
          ),
      }))
      .filter(
        (candidate) =>
          candidate.score > 0
      )
      .sort(
        (a, b) => {
          if (
            b.score !== a.score
          ) {
            return (
              b.score - a.score
            );
          }

          if (
            a.product.stock > 0 &&
            b.product.stock <= 0
          ) {
            return -1;
          }

          if (
            b.product.stock > 0 &&
            a.product.stock <= 0
          ) {
            return 1;
          }

          return (
            a.product.price -
            b.product.price
          );
        }
      );

  return (
    candidates[0]?.product ??
    null
  );
}

function calculateMatchScore(
  queryTokens: string[],
  product: Product
) {
  const productName =
    normalize(product.name);

  const category =
    normalize(product.category);

  const description =
    normalize(
      product.description
    );

  const unit =
    normalize(product.unit);

  let score = 0;

  for (
    const token of queryTokens
  ) {
    if (
      productName === token
    ) {
      score += 20;
    }

    if (
      productName.includes(
        token
      )
    ) {
      score += 10;
    }

    if (
      category.includes(
        token
      )
    ) {
      score += 4;
    }

    if (
      description.includes(
        token
      )
    ) {
      score += 2;
    }

    if (
      unit.includes(token)
    ) {
      score += 1;
    }
  }

  const fullQuery =
    queryTokens.join(" ");

  if (
    productName.includes(
      fullQuery
    )
  ) {
    score += 18;
  }

  return score;
}

function tokenize(
  value: string
) {
  return normalize(value)
    .split(" ")
    .filter(
      (token) =>
        token.length > 1
    );
}

function normalize(
  value: string
) {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9\s]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}