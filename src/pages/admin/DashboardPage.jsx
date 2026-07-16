import { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  Tags,
  Car,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { getCategories } from "../../api/categories";
import { getAllProductsApi } from "../../api/products";
import { getUsersApi } from "../../api/users";
import { getAllOrders, getOrderDashboardStats } from "../../api/orders";
// import { getOrderDashboardStats } from "../../api/orders";

import { getBrands } from "../../api/brands";
import { getMakes } from "../../api/vehicles";
import { getShipments } from "../../api/shipments";
import { getTransactionDashboardStats } from "../../api/transactions";
const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

import { Link } from "react-router-dom";
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
    key: "orders",
    label: "Orders",
    path: "/orders",
    icon: ShoppingCart,
    bg: "bg-amber-100",
    fg: "text-amber-600",
  },
  {
    key: "ordersToday",
    label: "Orders Today",
    path: "/orders",
    icon: ShoppingCart,
    bg: "bg-green-100",
    fg: "text-green-600",
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
    key: "transactions",
    label: "Transactions",
    path: "/transactions",
    icon: CreditCard,
    bg: "bg-cyan-100",
    fg: "text-cyan-600",
  },
  // {
  //   key: "pendingTx",
  //   label: "Pending Tx",
  //   path: "/transactions?status=pending",
  //   icon: CreditCard,
  //   bg: "bg-amber-100",
  //   fg: "text-amber-600",
  // },
  // {
  //   key: "txToday",
  //   label: "Tx Today",
  //   path: "/transactions",
  //   icon: CreditCard,
  //   bg: "bg-green-100",
  //   fg: "text-green-600",
  // },
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

const filterLinks = [
  { label: "Pending Orders", path: "/orders?status=pending" },
  { label: "Active Products", path: "/products?status=active" },
  { label: "Pending Shipments", path: "/shipments?status=pending" },
  { label: "Shipped Orders", path: "/orders?status=shipped" },
  { label: "Delivered Orders", path: "/orders?status=delivered" },
  { label: "In Transit Shipments", path: "/shipments?status=in_transit" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [
          products,
          users,
          categories,
          brands,
          makes,
          orderStats,
          txStats,
        ] = await Promise.all([
          getAllProductsApi({ limit: 1 }),
          getUsersApi().then((r) => r.data),
          getCategories({ limit: 1 }),
          getBrands({ limit: 1 }),
          getShipments({ limit: 1 }),
          getOrderDashboardStats().catch(() => null),
          getTransactionDashboardStats().catch(() => null),
        ]);
        setStats({
          products: products.pagination?.total ?? products.data?.length ?? 0,
          users: users.pagination?.total ?? users.length ?? 0,
          orders: orderStats?.data?.total_orders ?? 0,
          ordersToday: orderStats?.data?.new_orders_today ?? 0,
          categories: categories.pagination?.total ?? 0,
          brands: brands.pagination?.total ?? 0,
          shipments:
            makes.pagination?.totalItems ?? makes.pagination?.total ?? 0,
          transactions: txStats?.data?.total_transactions ?? 0,
          pendingTx: txStats?.data?.pending_transactions ?? 0,
          txToday: txStats?.data?.new_transactions_today ?? 0,
          txSuccessful: txStats?.data?.successful_transactions ?? 0,
          txFailed: txStats?.data?.failed_transactions ?? 0,
          txPayment: txStats?.data?.payment_transactions ?? 0,
          txRefund: txStats?.data?.refund_transactions ?? 0,
          txTodayAmount: txStats?.data?.today_successful_amount ?? 0,
          txTodayNet: txStats?.data?.today_net_amount ?? 0,
          txTotalAmount: txStats?.data?.total_successful_amount ?? 0,
          txTotalRefund: txStats?.data?.total_refund_amount ?? 0,
          txTotalNet: txStats?.data?.total_net_amount ?? 0,
        });
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-8">
        Overview of your 4x4 e-commerce store
      </p>
      <div className="my-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Quick Filters
        </h2>

        {stats.txTotalNet > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-3">
              Transaction Details
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Successful
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {stats.txSuccessful}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-lg font-bold text-amber-600 mt-1">
                  {stats.pendingTx}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Failed
                </p>
                <p className="text-lg font-bold text-rose-600 mt-1">
                  {stats.txFailed}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Payments
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {stats.txPayment}
                </p>
              </div>
              {/* <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Refunds
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {stats.txRefund}
                </p>
              </div> */}
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Today Amount
                </p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  {fmt(stats.txTodayAmount)}
                </p>
              </div>
              {/* <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Today Net
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {fmt(stats.txTodayNet)}
                </p>
              </div> */}
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Today Tx
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {stats.txToday}
                </p>
              </div>
              <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Total Amount
                </p>
                <p className="text-lg font-bold text-slate-900 mt-1">
                  {fmt(stats.txTotalAmount)}
                </p>
              </div>
              {/* <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Total Refund
                </p>
                <p className="text-lg font-bold text-rose-600 mt-1">
                  {fmt(stats.txTotalRefund)}
                </p>
              </div> */}
              {/* <div className="bg-white border border-slate-100 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Total Net
                </p>
                <p className="text-lg font-bold text-emerald-600 mt-1">
                  {fmt(stats.txTotalNet)}
                </p>
              </div> */}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {filterLinks.map(({ label, path }) => (
            <Link
              key={label}
              to={path}
              className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ key, label, path, icon: Icon, bg, fg }) => (
          <Link
            to={path}
            key={key}
            className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats[key] ?? "—"}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${bg}`}>
                <Icon size={24} className={fg} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
