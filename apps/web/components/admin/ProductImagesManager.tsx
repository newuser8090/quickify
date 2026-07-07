"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

import {
  deleteProductImage,
  getProductImages,
  addProductImage,
} from "@/services/productImageService";
import { uploadProductImage } from "@/services/storageService";

type Props = {
  productId: number;
};

export default function ProductImagesManager({ productId }: Props) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: images = [], isLoading } = useQuery({
    queryKey: ["product-images", productId],
    queryFn: () => getProductImages(productId),
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) return;

    try {
      setUploading(true);

      for (const file of files) {
        const imageUrl = await uploadProductImage(file);
        await addProductImage(productId, imageUrl, images.length);
      }

      toast.success("Images uploaded");

      queryClient.invalidateQueries({
        queryKey: ["product-images", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteProductImage(id);

      toast.success("Image deleted");

      queryClient.invalidateQueries({
        queryKey: ["product-images", productId],
      });

      queryClient.invalidateQueries({
        queryKey: ["product", productId],
      });
    } catch {
      toast.error("Failed to delete image");
    }
  }

  return (
    <div className="rounded-2xl border bg-gray-50 p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold">Extra Product Images</h3>
          <p className="text-sm text-gray-500">
            These images appear in the product gallery.
          </p>
        </div>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
          {uploading ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Uploading
            </>
          ) : (
            <>
              <ImagePlus size={16} />
              Upload
            </>
          )}

          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploading}
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading images...</p>
      ) : images.length === 0 ? (
        <p className="text-sm text-gray-500">No extra images added yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-xl border bg-white"
            >
              <Image
  src={image.image_url}
  alt="Product"
  width={96}
  height={96}
  className="h-24 w-24 rounded-xl object-cover"
/>

              <button
                type="button"
                onClick={() => handleDelete(image.id)}
                className="absolute right-2 top-2 rounded-full bg-red-600 p-2 text-white opacity-0 transition group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}