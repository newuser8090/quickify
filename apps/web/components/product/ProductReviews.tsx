"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";

import { Product } from "@/types/product";
import { useAuthStore } from "@/store/authStore";
import {
  getProductReviews,
  upsertProductReview,
} from "@/services/reviewService";

type Props = {
  product: Product;
};

export default function ProductReviews({ product }: Props) {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["product-reviews", product.id],
    queryFn: () => getProductReviews(product.id),
  });

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : product.rating;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to write a review");
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      await upsertProductReview(product.id, user.id, rating, comment);

      toast.success("Review submitted");
      setComment("");
      setRating(5);

      queryClient.invalidateQueries({
        queryKey: ["product-reviews", product.id],
      });
    } catch {
      toast.error("Failed to submit review");
    }
  }

  return (
    <section className="mt-12 rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Ratings & Reviews</h2>
          <p className="mt-2 text-gray-500">
            What customers think about this product.
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

      <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border bg-gray-50 p-5">
        <h3 className="text-xl font-bold">Write a Review</h3>

        <div className="mt-4 flex gap-2">
          {Array.from({ length: 5 }).map((_, index) => {
            const value = index + 1;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
              >
                <Star
                  size={24}
                  className={
                    value <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience..."
          className="mt-4 w-full rounded-xl border bg-white p-4 outline-none focus:border-green-600"
        />

        <button
          type="submit"
          className="mt-4 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
        >
          Submit Review
        </button>
      </form>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {isLoading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first one.</p>
        ) : (
          reviews.map((review) => (
            <ReviewCard
              key={review.id}
              rating={review.rating}
              text={review.comment}
              date={review.created_at}
            />
          ))
        )}
      </div>
    </section>
  );
}

function ReviewCard({
  rating,
  text,
  date,
}: {
  rating: number;
  text: string;
  date: string;
}) {
  return (
    <div className="rounded-2xl border bg-gray-50 p-5">
      <div className="flex items-center gap-1">
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

      <p className="mt-4 text-gray-600">{text}</p>

      <p className="mt-4 text-sm font-semibold text-gray-500">
        {new Date(date).toLocaleDateString()}
      </p>
    </div>
  );
}