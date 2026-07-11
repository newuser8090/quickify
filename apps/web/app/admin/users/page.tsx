"use client";

import { useMemo, useState } from "react";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Crown,
  Heart,
  Home,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  ShoppingBag,
  User,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  type AdminUserStats,
  getAdminUsers,
  updateUserRole,
} from "@/services/adminUserService";
import { useAuthStore } from "@/store/authStore";

type ManagedUserRole =
  | "customer"
  | "admin";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getUserPaidRevenue(
  user: AdminUserStats
) {
  return (user.orders ?? []).reduce(
    (sum, order) => {
      const status =
        order.status?.toLowerCase() ?? "";

      const paymentStatus =
        order.payment_status?.toLowerCase() ?? "";

      const refundStatus =
        order.refund_status?.toLowerCase() ?? "";

      const countsAsRevenue =
        status !== "cancelled" &&
        paymentStatus === "paid";

      if (!countsAsRevenue) {
        return sum;
      }

      const grossAmount = Number(
        order.total ?? 0
      );

      const refundAmount =
        refundStatus === "refunded"
          ? Number(order.refund_amount ?? 0)
          : 0;

      return (
        sum +
        Math.max(
          0,
          grossAmount - refundAmount
        )
      );
    },
    0
  );
}

function getRoleLabel(role: string | null) {
  if (role === "creator") {
    return "Creator";
  }

  if (role === "admin") {
    return "Admin";
  }

  return "Customer";
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();

  const currentUser = useAuthStore(
    (state) => state.user
  );

  const [search, setSearch] =
    useState("");

  const [selectedUser, setSelectedUser] =
    useState<AdminUserStats | null>(null);

  const [
    updatingRoleId,
    setUpdatingRoleId,
  ] = useState<string | null>(null);

  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  const filteredUsers = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    const matchingUsers = !searchValue
      ? users
      : users.filter((user) => {
          return (
            user.full_name
              ?.toLowerCase()
              .includes(searchValue) ||
            user.email
              ?.toLowerCase()
              .includes(searchValue) ||
            user.phone
              ?.toLowerCase()
              .includes(searchValue) ||
            user.role
              ?.toLowerCase()
              .includes(searchValue)
          );
        });

    const rolePriority: Record<
      string,
      number
    > = {
      creator: 0,
      admin: 1,
      customer: 2,
    };

    return [...matchingUsers].sort(
      (firstUser, secondUser) => {
        const firstPriority =
          rolePriority[
            firstUser.role ?? "customer"
          ] ?? 2;

        const secondPriority =
          rolePriority[
            secondUser.role ?? "customer"
          ] ?? 2;

        if (
          firstPriority !== secondPriority
        ) {
          return (
            firstPriority - secondPriority
          );
        }

        return (
          firstUser.full_name ||
          firstUser.email ||
          ""
        ).localeCompare(
          secondUser.full_name ||
            secondUser.email ||
            ""
        );
      }
    );
  }, [users, search]);

  const totalCustomerRevenue =
    users.reduce(
      (sum, user) =>
        sum + getUserPaidRevenue(user),
      0
    );

  async function handleRoleChange(
    user: AdminUserStats,
    role: ManagedUserRole
  ) {
    if (user.role === "creator") {
      toast.error(
        "The creator role cannot be changed"
      );
      return;
    }

    if (user.role === role) {
      return;
    }

    if (
      user.id === currentUser?.id &&
      role === "customer"
    ) {
      toast.error(
        "You cannot remove your own admin access"
      );
      return;
    }

    const confirmed = window.confirm(
      role === "admin"
        ? `Give admin access to ${
            user.full_name ||
            user.email ||
            "this user"
          }?`
        : `Remove admin access from ${
            user.full_name ||
            user.email ||
            "this user"
          }?`
    );

    if (!confirmed) return;

    try {
      setUpdatingRoleId(user.id);

      await updateUserRole(
        user.id,
        role
      );

      await queryClient.invalidateQueries({
        queryKey: ["admin-users"],
      });

      setSelectedUser((current) =>
        current?.id === user.id
          ? {
              ...current,
              role,
            }
          : current
      );

      toast.success(
        role === "admin"
          ? "User promoted to admin"
          : "Admin access removed"
      );
    } catch (error) {
      console.error(
        "Update user role error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update user role"
      );
    } finally {
      setUpdatingRoleId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Users
          </h1>

          <p className="mt-2 text-gray-500">
            View customers, manage admins,
            and identify the Quickify creator.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <StatCard
            label="Total Users"
            value={users.length}
          />

          <StatCard
            label="Customer Revenue"
            value={formatCurrency(
              totalCustomerRevenue
            )}
          />
        </div>
      </div>

      <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
        Customer revenue includes paid,
        non-cancelled orders after completed
        refunds are deducted.
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <Search
          size={20}
          className="text-gray-400"
        />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search users by name, email, phone, or role..."
          className="w-full bg-transparent outline-none"
        />
      </div>

      {isLoading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-gray-500 shadow-sm">
          Loading users...
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
          <h2 className="text-xl font-bold text-red-700">
            Users could not be loaded
          </h2>

          <p className="mt-2 text-sm text-red-600">
            Please check your connection and
            try again.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
          <Users
            className="mx-auto text-gray-400"
            size={44}
          />

          <h2 className="mt-4 text-2xl font-bold">
            No users found
          </h2>

          <p className="mt-2 text-gray-500">
            Try another search term.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((user) => {
            const paidRevenue =
              getUserPaidRevenue(user);

            const isCreator =
              user.role === "creator";

            return (
              <button
                key={user.id}
                type="button"
                onClick={() =>
                  setSelectedUser(user)
                }
                className={`relative overflow-hidden rounded-3xl p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  isCreator
                    ? "border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-yellow-50"
                    : "bg-white"
                }`}
              >
                {isCreator && (
                  <div className="absolute right-0 top-0 rounded-bl-3xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-amber-950">
                    PRIMARY OWNER
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        isCreator
                          ? "bg-amber-100 text-amber-700"
                          : user.role ===
                              "admin"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {isCreator ? (
                        <Crown size={27} />
                      ) : user.role ===
                        "admin" ? (
                        <ShieldCheck
                          size={26}
                        />
                      ) : (
                        <User size={26} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="line-clamp-1 text-lg font-bold">
                        {user.full_name ||
                          "Unnamed User"}
                      </h2>

                      <p className="mt-1 line-clamp-1 text-sm text-gray-500">
                        {user.email ||
                          "No email"}
                      </p>
                    </div>
                  </div>

                  {!isCreator && (
                    <RoleBadge
                      role={user.role}
                    />
                  )}
                </div>

                {isCreator && (
                  <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                    <Crown size={14} />
                    Quickify Creator
                  </div>
                )}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <SmallStat
                    label="Orders"
                    value={user.order_count}
                  />

                  <SmallStat
                    label="Spent"
                    value={formatCurrency(
                      paidRevenue
                    )}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          isCurrentUser={
            selectedUser.id ===
            currentUser?.id
          }
          updatingRole={
            updatingRoleId ===
            selectedUser.id
          }
          onRoleChange={(role) =>
            handleRoleChange(
              selectedUser,
              role
            )
          }
          onClose={() =>
            setSelectedUser(null)
          }
        />
      )}
    </AdminLayout>
  );
}

function UserDetailsModal({
  user,
  isCurrentUser,
  updatingRole,
  onRoleChange,
  onClose,
}: {
  user: AdminUserStats;
  isCurrentUser: boolean;
  updatingRole: boolean;
  onRoleChange: (
    role: ManagedUserRole
  ) => void;
  onClose: () => void;
}) {
  const addresses =
    user.addresses ?? [];

  const orders = user.orders ?? [];

  const wishlistItems =
    user.wishlist_items ?? [];

  const paidRevenue =
    getUserPaidRevenue(user);

  const isCreator =
    user.role === "creator";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-3xl font-bold">
                {user.full_name ||
                  "Unnamed User"}
              </h2>

              <RoleBadge
                role={user.role}
              />

              {isCurrentUser && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                  You
                </span>
              )}
            </div>

            <p className="mt-1 text-gray-500">
              Joined{" "}
              {user.created_at
                ? new Date(
                    user.created_at
                  ).toLocaleDateString(
                    "en-IN"
                  )
                : "Unknown"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-gray-100"
            aria-label="Close user details"
          >
            <X size={22} />
          </button>
        </div>

        {isCreator && (
          <div className="mt-6 flex items-start gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-5">
            <div className="rounded-2xl bg-amber-400 p-3 text-amber-950">
              <Crown size={24} />
            </div>

            <div>
              <h3 className="font-bold text-amber-900">
                Quickify Creator
              </h3>

              <p className="mt-1 text-sm text-amber-800">
                This is the primary owner of
                Quickify. Other admins cannot
                demote or replace the creator.
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <MiniStat
            icon={
              <ShoppingBag size={18} />
            }
            label="Orders"
            value={user.order_count}
          />

          <MiniStat
            icon={<Wallet size={18} />}
            label="Spent"
            value={formatCurrency(
              paidRevenue
            )}
          />

          <MiniStat
            icon={<Home size={18} />}
            label="Addresses"
            value={user.address_count}
          />

          <MiniStat
            icon={<Heart size={18} />}
            label="Wishlist"
            value={user.wishlist_count}
          />
        </div>

        <div className="mt-6 rounded-3xl border bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`rounded-2xl p-3 ${
                  isCreator
                    ? "bg-amber-100 text-amber-700"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {isCreator ? (
                  <Crown size={22} />
                ) : (
                  <ShieldCheck size={22} />
                )}
              </div>

              <div>
                <h3 className="font-bold">
                  Account Role
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  {isCreator
                    ? "The creator owns and controls the primary Quickify account."
                    : "Admins can access and manage the Quickify admin panel."}
                </p>

                {isCurrentUser &&
                  !isCreator && (
                    <p className="mt-2 text-xs font-semibold text-blue-600">
                      Your own admin role
                      cannot be removed here.
                    </p>
                  )}
              </div>
            </div>

            {isCreator ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="font-bold text-amber-800">
                  Creator
                </p>

                <p className="mt-1 text-xs text-amber-700">
                  Protected role
                </p>
              </div>
            ) : (
              <select
                value={
                  user.role === "admin" || user.role === "creator"
                    ? "admin"
                    : "customer"
                }
                disabled={
                  updatingRole ||
                  isCurrentUser
                }
                onChange={(event) =>
                  onRoleChange(
                    event.target
                      .value as ManagedUserRole
                  )
                }
                className="rounded-xl border bg-white px-4 py-3 font-semibold outline-none focus:border-green-600 disabled:cursor-not-allowed disabled:bg-gray-100"
              >
                <option value="customer">
                  Customer
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="Profile">
            <InfoLine
              icon={<Mail size={17} />}
              text={
                user.email ||
                "No email"
              }
            />

            <InfoLine
              icon={<Phone size={17} />}
              text={
                user.phone ||
                "No phone number"
              }
            />

            <InfoLine
              icon={
                isCreator ? (
                  <Crown size={17} />
                ) : (
                  <User size={17} />
                )
              }
              text={getRoleLabel(
                user.role
              )}
            />
          </Section>

          <Section title="Addresses">
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500">
                No saved addresses.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map(
                  (address) => (
                    <div
                      key={address.id}
                      className="rounded-2xl bg-gray-50 p-4"
                    >
                      <p className="font-bold">
                        {address.label ||
                          "Address"}
                      </p>

                      <p className="mt-1 text-sm text-gray-600">
                        {[
                          address.address_line,
                          address.landmark,
                          address.city,
                          address.state,
                          address.pincode,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {address.phone ||
                          "No phone number"}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="Orders">
            {orders.length === 0 ? (
              <p className="text-sm text-gray-500">
                No orders yet.
              </p>
            ) : (
              <div className="space-y-3">
                {orders
                  .slice(0, 5)
                  .map((order) => {
                    const countsAsRevenue =
                      order.status
                        ?.toLowerCase() !==
                        "cancelled" &&
                      order.payment_status
                        ?.toLowerCase() ===
                        "paid";

                    return (
                      <div
                        key={order.id}
                        className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4"
                      >
                        <div>
                          <p className="font-bold">
                            Order #{order.id}
                          </p>

                          <p className="text-sm text-gray-500">
                            {new Date(
                              order.created_at
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {
                              order.payment_method
                            }{" "}
                            •{" "}
                            {order.payment_status ??
                              "Pending"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              countsAsRevenue
                                ? "text-green-700"
                                : "text-gray-500"
                            }`}
                          >
                            {formatCurrency(
                              Number(
                                order.total ??
                                  0
                              )
                            )}
                          </p>

                          <p className="text-xs font-semibold text-gray-500">
                            {order.status}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </Section>

          <Section title="Wishlist">
            {wishlistItems.length === 0 ? (
              <p className="text-sm text-gray-500">
                No wishlist items.
              </p>
            ) : (
              <div className="space-y-3">
                {wishlistItems.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4"
                    >
                      <p className="font-bold">
                        {item.product
                          ?.name ||
                          "Product unavailable"}
                      </p>

                      <p className="font-bold text-green-700">
                        {formatCurrency(
                          Number(
                            item.product
                              ?.price ?? 0
                          )
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </Section>
        </div>
      </div>
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: string | null;
}) {
  const roleClassName =
    role === "creator"
      ? "bg-amber-100 text-amber-800"
      : role === "admin"
        ? "bg-purple-100 text-purple-700"
        : "bg-green-100 text-green-700";

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${roleClassName}`}
    >
      {role === "creator" && (
        <Crown size={13} />
      )}

      {getRoleLabel(role)}
    </span>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-2xl font-bold text-green-700">
        {value}
      </p>
    </div>
  );
}

function SmallStat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border bg-white p-5">
      <h3 className="mb-4 text-xl font-bold">
        {title}
      </h3>

      {children}
    </section>
  );
}

function InfoLine({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="mb-3 flex min-w-0 items-start gap-3 text-sm text-gray-600">
      <span className="shrink-0 text-green-600">
        {icon}
      </span>

      <span className="min-w-0 break-all">
        {text}
      </span>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="text-green-600">
        {icon}
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}
