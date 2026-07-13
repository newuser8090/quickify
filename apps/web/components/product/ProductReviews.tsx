"use client";

import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  Star,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import type { Product } from "@/types/product";
import { getProductReviews } from "@/services/reviewService";

type Props = {
  product: Product;
};

export default function ProductReviews({
  product,
}: Props) {
  const [
    showAllReviews,
    setShowAllReviews,
  ] = useState(false);

  const {
    data: reviews = [],
    isLoading,
  } = useQuery({
    queryKey: [
      "product-reviews",
      product.id,
    ],
    queryFn: () =>
      getProductReviews(
        product.id
      ),
  });

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return product.rating;
    }

    return (
      reviews.reduce(
        (total, review) =>
          total +
          Number(review.rating),
        0
      ) / reviews.length
    );
  }, [
    reviews,
    product.rating,
  ]);

  const ratingDistribution =
    useMemo(() => {
      return [5, 4, 3, 2, 1].map(
        (rating) => {
          const count =
            reviews.filter(
              (review) =>
                review.rating ===
                rating
            ).length;

          const percentage =
            reviews.length > 0
              ? Math.round(
                  (count /
                    reviews.length) *
                    100
                )
              : 0;

          return {
            rating,
            count,
            percentage,
          };
        }
      );
    }, [reviews]);

  const visibleReviews =
    showAllReviews
      ? reviews
      : reviews.slice(0, 3);

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm sm:mt-10">
      <div className="border-b border-gray-100 bg-gradient-to-r from-yellow-50 via-amber-50 to-white p-4 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-yellow-100 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-yellow-800 sm:text-xs">
              <Star
                size={13}
                className="fill-yellow-500 text-yellow-500"
              />
              Customer feedback
            </div>

            <h2 className="mt-3 text-xl font-extrabold text-gray-900 sm:text-3xl">
              Ratings & Reviews
            </h2>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
              Genuine feedback from customers who purchased and received this product.
            </p>
          </div>

          <div className="shrink-0 rounded-2xl border border-yellow-200 bg-white px-3 py-2 text-center shadow-sm sm:px-5 sm:py-4">
            <div className="flex items-center justify-center gap-1">
              <Star
                size={18}
                className="fill-yellow-400 text-yellow-400 sm:h-6 sm:w-6"
              />

              <span className="text-xl font-extrabold text-gray-900 sm:text-3xl">
                {averageRating.toFixed(
                  1
                )}
              </span>
            </div>

            <p className="mt-0.5 text-[10px] font-semibold text-gray-500 sm:text-xs">
              {reviews.length} review
              {reviews.length === 1
                ? ""
                : "s"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-7">
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:p-5">
            <p className="text-sm font-extrabold text-gray-900">
              Rating breakdown
            </p>

            <div className="mt-4 space-y-3">
              {ratingDistribution.map(
                ({
                  rating,
                  count,
                  percentage,
                }) => (
                  <div
                    key={rating}
                    className="grid grid-cols-[30px_1fr_36px] items-center gap-2"
                  >
                    <div className="flex items-center gap-1 text-xs font-bold text-gray-700">
                      {rating}

                      <Star
                        size={12}
                        className="fill-yellow-400 text-yellow-400"
                      />
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <span className="text-right text-[10px] font-semibold text-gray-500">
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="mt-5 rounded-xl bg-white p-3 text-xs leading-5 text-gray-500">
              Reviews can only be submitted from completed Quickify orders.
            </div>
          </div>

          <div>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({
                  length: 3,
                }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-36 animate-pulse rounded-2xl bg-gray-100"
                    />
                  )
                )}
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-5 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-300 shadow-sm">
                  <MessageSquareText
                    size={28}
                  />
                </div>

                <h3 className="mt-4 text-base font-extrabold text-gray-900">
                  No reviews yet
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
                  Be the first verified customer to review this product after delivery.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {visibleReviews.map(
                  (review) => (
                    <ReviewCard
                      key={review.id}
                      rating={
                        review.rating
                      }
                      text={
                        review.comment
                      }
                      date={
                        review.created_at
                      }
                      reviewerEmail={
                        review.reviewer_email
                      }
                      verified={
                        review.is_verified_buyer
                      }
                      edited={
                        review.is_edited
                      }
                    />
                  )
                )}
              </div>
            )}
          </div>
        </div>

        {reviews.length > 3 && (
          <button
            type="button"
            onClick={() =>
              setShowAllReviews(
                (current) =>
                  !current
              )
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-3 text-sm font-bold text-yellow-800 transition hover:bg-yellow-100 sm:w-auto"
          >
            {showAllReviews ? (
              <>
                <ChevronUp
                  size={17}
                />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown
                  size={17}
                />
                View All Reviews (
                {reviews.length})
              </>
            )}
          </button>
        )}
      </div>
    </section>
  );
}

function ReviewCard({
  rating,
  text,
  date,
  reviewerEmail,
  verified,
  edited,
}: {
  rating: number;
  text: string;
  date: string;
  reviewerEmail: string | null;
  verified: boolean;
  edited: boolean;
}) {
  const displayName =
    reviewerEmail
      ? reviewerEmail.replace(
          /^(.{3}).+(@.*)$/,
          "$1***$2"
        )
      : "Anonymous customer";

  const initial =
    displayName
      .charAt(0)
      .toUpperCase() || "Q";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-yellow-200 hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 text-sm font-extrabold text-white">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-gray-900">
              {displayName}
            </p>

            {verified && (
              <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-green-700">
                <BadgeCheck
                  size={13}
                />
                Verified Buyer
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-extrabold text-yellow-800">
          <Star
            size={12}
            className="fill-yellow-500 text-yellow-500"
          />

          {rating}
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-6 text-gray-600">
        {text}
      </p>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
        <span className="text-[10px] font-medium text-gray-400">
          {new Date(
            date
          ).toLocaleDateString(
            "en-IN",
            {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }
          )}
        </span>

        {edited && (
          <span className="rounded-full bg-blue-50 px-2 py-1 text-[9px] font-bold text-blue-600">
            Edited
          </span>
        )}
      </div>
    </article>
  );
}
