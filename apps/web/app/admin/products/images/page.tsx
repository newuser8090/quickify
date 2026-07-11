"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  FileImage,
  ImagePlus,
  Loader2,
  Search,
  Upload,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  addBulkProductGalleryImage,
  clearProductGalleryImages,
  getBulkImageProducts,
  type BulkImageProduct,
  updateProductMainImage,
} from "@/services/bulkProductImageService";
import { uploadProductImage } from "@/services/storageService";

type ParsedImageFile = {
  file: File;
  slug: string;
  type: "main" | "gallery";
  sortOrder: number;
  product: BulkImageProduct | null;
};

type UploadResult = {
  filename: string;
  productName: string | null;
  status: "success" | "failed" | "unmatched";
  message: string;
};

function removeFileExtension(filename: string) {
  const finalDotIndex = filename.lastIndexOf(".");

  return finalDotIndex >= 0
    ? filename.slice(0, finalDotIndex)
    : filename;
}

function parseImageFilename(
  file: File,
  productsBySlug: Map<string, BulkImageProduct>
): ParsedImageFile {
  const baseName = removeFileExtension(file.name)
    .toLowerCase()
    .trim();

  const mainMatch = baseName.match(/^(.*)-main$/);

  if (mainMatch?.[1]) {
    const slug = mainMatch[1];

    return {
      file,
      slug,
      type: "main",
      sortOrder: 0,
      product: productsBySlug.get(slug) ?? null,
    };
  }

  const galleryMatch = baseName.match(/^(.*)-(\d+)$/);

  if (galleryMatch?.[1] && galleryMatch[2]) {
    const slug = galleryMatch[1];
    const sortOrder = Number(galleryMatch[2]);

    return {
      file,
      slug,
      type: "gallery",
      sortOrder,
      product: productsBySlug.get(slug) ?? null,
    };
  }

  return {
    file,
    slug: baseName,
    type: "main",
    sortOrder: 0,
    product: null,
  };
}

export default function BulkProductImagesPage() {
  const queryClient = useQueryClient();

  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [replaceGallery, setReplaceGallery] =
    useState(false);

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["bulk-image-products"],
    queryFn: getBulkImageProducts,
  });

  const productsBySlug = useMemo(() => {
    return new Map(
      products.map((product) => [
        product.slug.toLowerCase(),
        product,
      ])
    );
  }, [products]);

  const parsedFiles = useMemo(() => {
    return files.map((file) =>
      parseImageFilename(file, productsBySlug)
    );
  }, [files, productsBySlug]);

  const visibleFiles = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return parsedFiles;
    }

    return parsedFiles.filter((item) => {
      return (
        item.file.name.toLowerCase().includes(searchValue) ||
        item.slug.includes(searchValue) ||
        item.product?.name
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [parsedFiles, search]);

  const matchedCount = parsedFiles.filter(
    (item) => item.product
  ).length;

  const unmatchedCount =
    parsedFiles.length - matchedCount;

  const mainImageCount = parsedFiles.filter(
    (item) => item.type === "main" && item.product
  ).length;

  const galleryImageCount = parsedFiles.filter(
    (item) => item.type === "gallery" && item.product
  ).length;

  function handleFilesSelected(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const selectedFiles = Array.from(
      event.target.files ?? []
    ).filter((file) =>
      file.type.startsWith("image/")
    );

    setFiles(selectedFiles);
    setResults([]);
    setProcessedCount(0);

    event.target.value = "";
  }

  function clearSelection() {
    if (uploading) return;

    setFiles([]);
    setResults([]);
    setProcessedCount(0);
    setSearch("");
  }

  async function handleBulkUpload() {
    if (parsedFiles.length === 0) {
      toast.error("Please select product images");
      return;
    }

    const matchedFiles = parsedFiles.filter(
      (item) => item.product
    );

    if (matchedFiles.length === 0) {
      toast.error(
        "None of the selected files match a product slug"
      );
      return;
    }

    const confirmed = window.confirm(
      `Upload ${matchedFiles.length} matched image${
        matchedFiles.length === 1 ? "" : "s"
      }?`
    );

    if (!confirmed) return;

    setUploading(true);
    setProcessedCount(0);
    setResults([]);

    const nextResults: UploadResult[] = [];

    try {
      if (replaceGallery) {
        const galleryProductIds = Array.from(
          new Set(
            matchedFiles
              .filter(
                (item) => item.type === "gallery"
              )
              .map((item) => item.product!.id)
          )
        );

        for (const productId of galleryProductIds) {
          await clearProductGalleryImages(productId);
        }
      }

      for (const item of parsedFiles) {
        if (!item.product) {
          nextResults.push({
            filename: item.file.name,
            productName: null,
            status: "unmatched",
            message:
              "No product found with the matching slug.",
          });

          setProcessedCount((count) => count + 1);
          continue;
        }

        try {
          const imageUrl =
            await uploadProductImage(item.file);

          if (item.type === "main") {
            await updateProductMainImage(
              item.product.id,
              imageUrl
            );
          } else {
            await addBulkProductGalleryImage({
              productId: item.product.id,
              imageUrl,
              sortOrder: item.sortOrder,
            });
          }

          nextResults.push({
            filename: item.file.name,
            productName: item.product.name,
            status: "success",
            message:
              item.type === "main"
                ? "Main image updated."
                : `Gallery image added at position ${item.sortOrder}.`,
          });
        } catch (error) {
          nextResults.push({
            filename: item.file.name,
            productName: item.product.name,
            status: "failed",
            message:
              error instanceof Error
                ? error.message
                : "Image upload failed.",
          });
        }

        setProcessedCount((count) => count + 1);
      }

      setResults(nextResults);

      const successCount = nextResults.filter(
        (result) => result.status === "success"
      ).length;

      const failedCount = nextResults.filter(
        (result) => result.status === "failed"
      ).length;

      if (failedCount === 0) {
        toast.success(
          `${successCount} images uploaded successfully`
        );
      } else {
        toast.warning(
          `${successCount} uploaded, ${failedCount} failed`
        );
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["bulk-image-products"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["admin-products"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["products"],
        }),
      ]);
    } finally {
      setUploading(false);
    }
  }

  const progress =
    parsedFiles.length > 0
      ? Math.round(
          (processedCount / parsedFiles.length) * 100
        )
      : 0;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">
            Bulk Product Images
          </h1>

          <p className="mt-2 text-gray-500">
            Upload main and gallery images by matching
            filenames to product slugs.
          </p>
        </div>

        <section className="rounded-3xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-bold text-blue-900">
            Required filename format
          </h2>

          <div className="mt-3 space-y-1 font-mono text-sm text-blue-800">
            <p>
              amul-taaza-toned-milk-main.webp
            </p>
            <p>
              amul-taaza-toned-milk-2.webp
            </p>
            <p>
              amul-taaza-toned-milk-3.webp
            </p>
          </div>

          <p className="mt-3 text-sm text-blue-700">
            The part before <strong>-main</strong> or the
            final image number must exactly match the
            product slug.
          </p>
        </section>

        {isLoading ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <Loader2 className="mx-auto animate-spin text-green-600" />
            <p className="mt-3 text-gray-500">
              Loading products...
            </p>
          </section>
        ) : isError ? (
          <section className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
            <h2 className="text-xl font-bold text-red-700">
              Products could not be loaded
            </h2>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-5 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white"
            >
              Try Again
            </button>
          </section>
        ) : (
          <>
            <section className="rounded-3xl bg-white p-6 shadow-sm">
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 px-6 py-12 text-center transition hover:border-green-500 hover:bg-green-50">
                <ImagePlus
                  size={42}
                  className="text-green-600"
                />

                <p className="mt-4 text-lg font-bold">
                  Select product images
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  You can select all main and gallery
                  images at once.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploading}
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </label>
            </section>

            {files.length > 0 && (
              <>
                <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    label="Selected Files"
                    value={files.length}
                  />

                  <StatCard
                    label="Matched"
                    value={matchedCount}
                  />

                  <StatCard
                    label="Main Images"
                    value={mainImageCount}
                  />

                  <StatCard
                    label="Gallery Images"
                    value={galleryImageCount}
                  />
                </section>

                {unmatchedCount > 0 && (
                  <section className="rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
                    <strong>{unmatchedCount}</strong>{" "}
                    file
                    {unmatchedCount === 1 ? "" : "s"} do
                    not match any product slug. These files
                    will be skipped.
                  </section>
                )}

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex w-full items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 lg:max-w-md">
                      <Search
                        size={18}
                        className="text-gray-400"
                      />

                      <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                          setSearch(event.target.value)
                        }
                        placeholder="Search selected images..."
                        className="w-full outline-none"
                      />
                    </div>

                    <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                      <input
                        type="checkbox"
                        checked={replaceGallery}
                        disabled={uploading}
                        onChange={(event) =>
                          setReplaceGallery(
                            event.target.checked
                          )
                        }
                      />

                      Replace existing gallery images for
                      matched products
                    </label>
                  </div>

                  <div className="mt-5 max-h-[520px] overflow-y-auto rounded-2xl border border-gray-200">
                    {visibleFiles.map((item) => (
                      <div
                        key={`${item.file.name}-${item.file.lastModified}`}
                        className="flex flex-col gap-3 border-b border-gray-100 p-4 last:border-none sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileImage className="shrink-0 text-green-600" />

                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {item.file.name}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {item.product
                                ? `${item.product.name} • ${
                                    item.type === "main"
                                      ? "Main image"
                                      : `Gallery #${item.sortOrder}`
                                  }`
                                : `No product found for slug: ${item.slug}`}
                            </p>
                          </div>
                        </div>

                        {item.product ? (
                          <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            Matched
                          </span>
                        ) : (
                          <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                            Unmatched
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {uploading && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between text-sm font-semibold text-gray-600">
                        <span>
                          Uploading {processedCount} of{" "}
                          {parsedFiles.length}
                        </span>

                        <span>{progress}%</span>
                      </div>

                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-green-600 transition-all"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={clearSelection}
                      disabled={uploading}
                      className="rounded-xl border border-gray-200 px-5 py-3 font-semibold transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      onClick={handleBulkUpload}
                      disabled={
                        uploading || matchedCount === 0
                      }
                      className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {uploading ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                        />
                      ) : (
                        <Upload size={18} />
                      )}

                      {uploading
                        ? "Uploading..."
                        : `Upload ${matchedCount} Images`}
                    </button>
                  </div>
                </section>
              </>
            )}

            {results.length > 0 && (
              <section className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">
                  Upload Results
                </h2>

                <div className="mt-5 max-h-[480px] overflow-y-auto rounded-2xl border border-gray-200">
                  {results.map((result, index) => (
                    <div
                      key={`${result.filename}-${index}`}
                      className="flex items-start gap-3 border-b border-gray-100 p-4 last:border-none"
                    >
                      {result.status === "success" ? (
                        <CheckCircle2 className="mt-0.5 shrink-0 text-green-600" />
                      ) : (
                        <XCircle className="mt-0.5 shrink-0 text-red-600" />
                      )}

                      <div>
                        <p className="font-semibold">
                          {result.filename}
                        </p>

                        {result.productName && (
                          <p className="mt-1 text-sm text-gray-600">
                            {result.productName}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-gray-500">
                          {result.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold">
        {value}
      </p>
    </div>
  );
}
