import { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  Tags,
  Car,
  ClipboardList,
  Clock3,
  Truck,
  CircleCheckBig,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { Link } from "react-router-dom";

import { getCategories } from "../../api/categories";
import { getAllProductsApi } from "../../api/products";
import { getUsersApi } from "../../api/users";
import { getAllOrders, getOrderDashboardStats } from "../../api/orders";
import { getBrands } from "../../api/brands";
import { getShipments } from "../../api/shipments";

const statCards = [
  {
    key: "products",
    label: "Products",
    path: "/products",
    icon: Package,
    bg: "bg-indigo-100",
    fg: "text-indigo-600",
  },
  {
    key: "users",
    label: "Users",
    path: "/users",
    icon: Users,
    bg: "bg-emerald-100",
    fg: "text-emerald-600",
  },
  {
    key: "orders",
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart,
    bg: "bg-amber-100",
    fg: "text-amber-600",
  },
  {
    key: "categories",
    label: "Categories",
    path: "/categories",
    icon: Tags,
    bg: "bg-purple-100",
    fg: "text-purple-600",
  },
  {
    key: "brands",
    label: "Brands",
    path: "/brands",
    icon: ClipboardList,
    bg: "bg-rose-100",
    fg: "text-rose-600",
  },
  {
    key: "shipments",
    label: "Shipments",
    path: "/shipments",
    icon: Car,
    bg: "bg-blue-100",
    fg: "text-blue-600",
  },
];

const orderStatCards = [
  {
    key: "new_orders_today",
    label: "New Orders Today",
    path: "/orders?date=today",
    icon: ShoppingBag,
    bg: "bg-cyan-100",
    fg: "text-cyan-600",
  },
  {
    key: "pending_orders",
    label: "Pending Orders",
    path: "/orders?status=pending",
    icon: Clock3,
    bg: "bg-yellow-100",
    fg: "text-yellow-600",
  },
  {
    key: "shipped_orders",
    label: "Shipped Orders",
    path: "/orders?status=shipped",
    icon: Truck,
    bg: "bg-blue-100",
    fg: "text-blue-600",
  },
  {
    key: "delivered_orders",
    label: "Delivered Orders",
    path: "/orders?status=delivered",
    icon: CircleCheckBig,
    bg: "bg-green-100",
    fg: "text-green-600",
  },
  {
    key: "orders_pending",
    label: "Orders Pending",
    path: "/orders?payment_status=pending",
    icon: CreditCard,
    bg: "bg-red-100",
    fg: "text-red-600",
  },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({});
  const [orderStats, setOrderStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [
          products,
          usersResponse,
          orders,
          categories,
          brands,
          shipments,
          orderDashboardStats,
        ] = await Promise.all([
          getAllProductsApi({ limit: 1 }),
          getUsersApi(),
          getAllOrders({ limit: 1 }),
          getCategories({ limit: 1 }),
          getBrands({ limit: 1 }),
          getShipments({ limit: 1 }),
          getOrderDashboardStats(),
        ]);

        const users = usersResponse?.data ?? usersResponse;

        setStats({
          products: products?.pagination?.total ?? products?.data?.length ?? 0,

          users:
            users?.pagination?.total ??
            users?.data?.length ??
            users?.length ??
            0,

          orders:
            orders?.pagination?.total ??
            orderDashboardStats?.data?.total_orders ??
            0,

          categories:
            categories?.pagination?.total ?? categories?.data?.length ?? 0,

          brands: brands?.pagination?.total ?? brands?.data?.length ?? 0,

          shipments:
            shipments?.pagination?.totalItems ??
            shipments?.pagination?.total ??
            shipments?.data?.length ??
            0,
        });

        setOrderStats(orderDashboardStats?.data ?? {});
      } catch (error) {
        console.error("Dashboard loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Dashboard</h1>

      <p className="mb-8 text-sm text-slate-500">
        Overview of your 4x4 e-commerce store
      </p>
      <div className="mb-4 mt-10">
        <h2 className="text-lg font-bold text-slate-900">Order Overview</h2>

        <p className="text-sm text-slate-500">
          Current order and payment status
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {orderStatCards.map(({ key, label, path, icon: Icon, bg, fg }) => (
          <Link
            to={path}
            key={key}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading ? "—" : (orderStats[key] ?? 0)}
                </p>
              </div>

              <div className={`rounded-xl p-3 ${bg}`}>
                <Icon size={24} className={fg} />
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Today&apos;s Revenue
          </p>

          <p className="mt-1 text-3xl font-bold text-slate-900">
            ₹{Number(orderStats.today_revenue || 0).toLocaleString("en-IN")}
          </p>
        </div>
        {statCards.map(({ key, label, path, icon: Icon, bg, fg }) => (
          <Link
            to={path}
            key={key}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-900">
                  {loading ? "—" : (stats[key] ?? 0)}
                </p>
              </div>

              <div className={`rounded-xl p-3 ${bg}`}>
                <Icon size={24} className={fg} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
