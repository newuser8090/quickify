"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

import { Product } from "@/types/product";
import { getProductReviews } from "@/services/reviewService";

type Props = {
  product: Product;
};

export default function ProductReviews({ product }: Props) {
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", product.id],
    queryFn: () => getProductReviews(product.id),
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : product.rating;

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  return (
    <section className="mt-12 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Ratings & Reviews</h2>
          <p className="mt-2 text-gray-500">
            Reviews can be written from delivered orders only.
          </p>
        </div>

        <div className="rounded-3xl bg-yellow-50 p-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <Star className="fill-yellow-400 text-yellow-400" />
            <span className="text-4xl font-bold">
              {averageRating.toFixed(1)}
            </span>
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Based on {reviews.length} reviews
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          visibleReviews.map((review) => (
            <ReviewCard
              key={review.id}
              rating={review.rating}
              text={review.comment}
              date={review.created_at}
              reviewerEmail={review.reviewer_email}
              verified={review.is_verified_buyer}
              edited={review.is_edited}
            />
          ))
        )}
      </div>

      {reviews.length > 3 && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAllReviews((prev) => !prev)}
            className="rounded-xl border px-6 py-3 font-semibold text-green-700 hover:bg-green-50"
          >
            {showAllReviews
              ? "Show Less Reviews"
              : `See All Reviews (${reviews.length})`}
          </button>
        </div>
      )}
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
  const displayName = reviewerEmail
    ? reviewerEmail.replace(/^(.{6}).+(@.*)$/, "$1***$2")
    : "Anonymous";

  return (
    <div className="rounded-2xl border bg-gray-50 p-5 transition hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">{displayName}</p>

          <div className="mt-2 flex flex-wrap gap-2">
            {verified && (
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                ✓ Verified Buyer
              </span>
            )}

            {edited && (
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                Edited
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={16}
              className={
                index < rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          ))}
        </div>
      </div>

      <p className="mt-4 leading-7 text-gray-600">{text}</p>

      <p className="mt-5 text-sm text-gray-500">
        {new Date(date).toLocaleDateString()}
      </p>
    </div>
  );
}