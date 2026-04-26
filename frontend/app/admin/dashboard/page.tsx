"use client";

import { useState } from "react";
import { useProducts, useDeleteProduct } from "@/application/hooks/useProducts";
import { useAllOrders, useUpdateOrderStatus } from "@/application/hooks/useOrders";
import { AuthGuard } from "@/components/auth/authGuard";
import { AddProductForm } from "@/components/admin/addProductForm";
import { EditProductForm } from "@/components/admin/editProductForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrderStatus } from "@/domain/entities/orderEntity";
import { Trash2, Package, ShoppingBag, Pencil, Plus, X } from "lucide-react";

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    pending:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800" },
    paid:      { label: "Paid",      className: "bg-blue-100 text-blue-800"     },
    shipped:   { label: "Shipped",   className: "bg-purple-100 text-purple-800" },
    delivered: { label: "Delivered", className: "bg-green-100 text-green-800"   },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800"       },
  };

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  return (
    <AuthGuard requireAdmin>
      <DashboardContent />
    </AuthGuard>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

const DashboardContent = () => {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("orders");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold text-zinc-900">
        Admin Dashboard
      </h1>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-zinc-200">
        <TabButton
          active={activeTab === "orders"}
          onClick={() => setActiveTab("orders")}
          icon={<ShoppingBag className="h-4 w-4" />}
          label="Orders"
        />
        <TabButton
          active={activeTab === "products"}
          onClick={() => setActiveTab("products")}
          icon={<Package className="h-4 w-4" />}
          label="Products"
        />
      </div>

      {activeTab === "orders"   && <OrdersTab />}
      {activeTab === "products" && <ProductsTab />}
    </main>
  );
};

// ─── Orders Tab ───────────────────────────────────────────────────────────────

const OrdersTab = () => {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();
  const { data, isLoading }             = useAllOrders({
    status: statusFilter,
    limit:  20,
  });

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Select
          value={statusFilter || "all"}
          onValueChange={(val) =>
            setStatusFilter(val === "all" ? undefined : (val as OrderStatus))
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        {data && (
          <p className="text-sm text-zinc-500">
            {data.pagination?.totalOrders ?? data.orders.length} orders
          </p>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && data && (
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.orders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </tbody>
          </table>

          {data.orders.length === 0 && (
            <div className="py-12 text-center text-sm text-zinc-500">
              No orders found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Order Row ────────────────────────────────────────────────────────────────

const OrderRow = ({ order }: { order: any }) => {
  const { mutate: updateStatus, isPending } = useUpdateOrderStatus(order.id);

  return (
    <tr className="transition hover:bg-zinc-50">
      <td className="px-4 py-3 font-mono text-xs text-zinc-600">
        #{order.id.slice(-8).toUpperCase()}
      </td>
      <td className="px-4 py-3 text-zinc-900">
        {order.user?.name || "—"}
        <p className="text-xs text-zinc-400">{order.user?.email}</p>
      </td>
      <td className="px-4 py-3 text-zinc-600">{order.items.length} items</td>
      <td className="px-4 py-3 font-medium text-zinc-900">
        LE {order.totalPrice.toLocaleString()}
      </td>
      <td className="px-4 py-3 text-zinc-500">
        {new Date(order.createdAt).toLocaleDateString("en-EG", {
          month: "short",
          day:   "numeric",
          year:  "numeric",
        })}
      </td>
      <td className="px-4 py-3">
        <Select
          value={order.status}
          onValueChange={(val) => updateStatus(val as OrderStatus)}
          disabled={isPending}
        >
          <SelectTrigger className="h-7 w-32 text-xs">
            <SelectValue>
              <Badge className={STATUS_CONFIG[order.status as OrderStatus].className}>
                {STATUS_CONFIG[order.status as OrderStatus].label}
              </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_CONFIG).map(([value, config]) => (
              <SelectItem key={value} value={value}>
                {config.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
    </tr>
  );
};

// ─── Products Tab ─────────────────────────────────────────────────────────────

const ProductsTab = () => {
  const { data, isLoading }                       = useProducts({ limit: 50 });
  const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

  // Controls which panel is open — "add", product id for edit, or null
  const [activePanel, setActivePanel]   = useState<"add" | string | null>(null);
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const editingProduct = activePanel && activePanel !== "add"
    ? data?.products.find((p) => p.id === activePanel) ?? null
    : null;

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    setDeletingId(id);
    // Close edit panel if deleting the product being edited
    if (activePanel === id) setActivePanel(null);
    deleteProduct(id, { onSettled: () => setDeletingId(null) });
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        {data && (
          <p className="text-sm text-zinc-500">
            {data.pagination.totalProducts} products
          </p>
        )}

        {/* Toggle Add Form */}
        <Button
          size="sm"
          variant={activePanel === "add" ? "outline" : "default"}
          onClick={() =>
            setActivePanel((prev) => (prev === "add" ? null : "add"))
          }
        >
          {activePanel === "add" ? (
            <>
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Product
            </>
          )}
        </Button>
      </div>

      {/* ── Add Product Form ──────────────────────────────────────────────── */}
      {activePanel === "add" && (
        <div className="rounded-xl border border-zinc-200 p-6">
          <h3 className="mb-5 text-base font-medium text-zinc-900">
            Add New Product
          </h3>
          <AddProductForm
            onSuccess={() => setActivePanel(null)}
          />
        </div>
      )}

      {/* ── Edit Product Form ─────────────────────────────────────────────── */}
      {editingProduct && (
        <div className="rounded-xl border border-zinc-200 p-6">
          <h3 className="mb-5 text-base font-medium text-zinc-900">
            Edit — {editingProduct.name}
          </h3>
          <EditProductForm
            product={editingProduct}
            onSuccess={() => setActivePanel(null)}
            onCancel={() => setActivePanel(null)}
          />
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      )}

      {/* ── Products Table ────────────────────────────────────────────────── */}
      {!isLoading && data && (
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Sizes</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.products.map((product) => (
                <tr
                  key={product.id}
                  className={`transition hover:bg-zinc-50 ${
                    activePanel === product.id ? "bg-zinc-50" : ""
                  }`}
                >
                  {/* Product Info */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-10 flex-shrink-0 overflow-hidden rounded-md bg-zinc-100">
                        {product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <p className="line-clamp-2 font-medium text-zinc-900">
                        {product.name}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-3 capitalize text-zinc-600">
                    {product.category}
                  </td>

                  <td className="px-4 py-3 capitalize text-zinc-600">
                    {product.gender}
                  </td>

                  <td className="px-4 py-3 font-medium text-zinc-900">
                    LE {product.price.toLocaleString()}
                  </td>

                  {/* Variants */}
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {product.variants.map((v) => (
                        <span
                          key={v.size}
                          className={`rounded px-1.5 py-0.5 text-xs ${
                            v.stock === 0
                              ? "bg-zinc-100 text-zinc-400 line-through"
                              : "bg-zinc-900 text-white"
                          }`}
                        >
                          {v.size}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Actions — Edit + Delete */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">

                      {/* Edit Button → useUpdateProduct */}
                      <button
                        onClick={() =>
                          setActivePanel((prev) =>
                            prev === product.id ? null : product.id
                          )
                        }
                        className={`rounded-md p-1.5 transition ${
                          activePanel === product.id
                            ? "bg-zinc-900 text-white"
                            : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900"
                        }`}
                        title="Edit product"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      {/* Delete Button → useDeleteProduct */}
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isDeleting && deletingId === product.id}
                        className="rounded-md p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                        title="Delete product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Tab Button ───────────────────────────────────────────────────────────────

const TabButton = ({
  active, onClick, icon, label,
}: {
  active:   boolean;
  onClick:  () => void;
  icon:     React.ReactNode;
  label:    string;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
      active
        ? "border-zinc-900 text-zinc-900"
        : "border-transparent text-zinc-500 hover:text-zinc-700"
    }`}
  >
    {icon}
    {label}
  </button>
);