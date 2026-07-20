import CrudPage from "../../components/shared/CrudPage";
import Modal from "../../components/shared/Modal";
import {
  getCoupons,
  createCoupon,
  deleteCoupon,
  toggleCouponStatus,
  updateCoupon,
  getCouponById,
} from "../../api/coupons";
import { useEffect, useState } from "react";
import StatusBadge from "../../components/shared/StatusBadge";
import { Eye, Loader2 } from "lucide-react";

const defaultForm = {
  discount_type: "percentage",
  discount_value: "",
  min_order_amount: 0,
  max_discount_amount: "",
  usage_limit_per_user: 1,
  total_usage_limit: "",
  valid_from: "",
  valid_to: "",
  description: "",
  custom_code: "",
};
function CouponFilter({ filterState, setFilterState }) {
  const [searchInput, setSearchInput] = useState(filterState.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterState({ ...filterState, search: searchInput });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2  gap-3">
      <input
        type="text"
        placeholder="Search by Coupone Code or ref..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
      <select
        value={filterState.status || ""}
        onChange={(e) =>
          setFilterState({ ...filterState, status: e.target.value })
        }
        className="px-3 py-2 rounded-xl border border-slate-200 text-sm"
      >
        <option value="all">All</option>
        <option value="active">Active</option>
        <option value="expired">Expired</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
export default function CouponsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const handleViewDetails = async (row) => {
    setViewLoading(true);
    setViewModalOpen(true);
    try {
      const res = await getCouponById(row.id);
      setViewData(res.data);
    } catch (err) {
      setViewData(null);
    } finally {
      setViewLoading(false);
    }
  };

  const handleToggle = async (row) => {
    await toggleCouponStatus(row);
    setRefreshKey((prev) => prev + 1); // trigger re-fetch
  };

  const handleDelete = async (row) => {
    if (!window.confirm("Delete this coupon permanently?")) return;
    try {
      await deleteCoupon(row.id);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };
  return (
    <>
      <CrudPage
        key={refreshKey} // force re‑mount and re‑fetch when changed
        title="Coupons"
        description="Create and view coupon templates"
        idKey="id"
        canEdit={true}
        canDelete={true} // disable built-in delete
        toggleStatus={handleToggle} // disable built-in toggle
        modalWide
        defaultForm={defaultForm}
        fetchList={(page, filters) =>
          getCoupons({
            page,
            limit: 10,
            search: filters.search,
            status: filters.status || "all",
          })
        }
        createItem={createCoupon}
        updateItem={updateCoupon}
      
        FilterComponent={CouponFilter}
        deleteItem={deleteCoupon}
        columns={[
          { key: "no", label: "Serial" },
          { key: "code", label: "Code" },
          { key: "discount_type", label: "Type" },
          { key: "discount_value", label: "Value" },
          {
            key: "valid_from",
            label: "From",
            render: (r) => new Date(r.valid_from).toLocaleDateString(),
          },
          {
            key: "valid_to",
            label: "To",
            render: (r) => new Date(r.valid_to).toLocaleDateString(),
          },
          {
            key: "status",
            label: "Status",
            render: (r) => {
              let status = r.is_active ? "active" : "inactive";
              if (
                r.is_active &&
                r.valid_to &&
                new Date(r.valid_to) < new Date()
              ) {
                status = "expired";
              } else if (
                r.is_active &&
                r.valid_from &&
                new Date(r.valid_from) > new Date()
              ) {
                status = "upcoming";
              }
              return <StatusBadge status={status} />;
            },
          },
          {
            key: "view",
            label: "View",
            render: (row) => (
              <button
                type="button"
                onClick={() => handleViewDetails(row)}
                className="p-2 rounded-lg border border-slate-200 hover:border-primary/30 hover:text-primary transition-colors"
                title="View details"
              >
                <Eye size={16} />
              </button>
            ),
          },
          // Custom actions column
          // {
          //   key: "actions",
          //   label: "Actions",
          //   // render: (row) => (
          //   //   <div className="flex items-center gap-1 justify-end">
          //   //     <button
          //   //       type="button"
          //   //       onClick={() => handleToggle(row)}
          //   //       className="p-2 rounded-lg border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
          //   //       title={row.is_active ? "Deactivate" : "Activate"}
          //   //     >
          //   //       {row.is_active ? (
          //   //         <ToggleRight size={16} />
          //   //       ) : (
          //   //         <ToggleLeft size={16} />
          //   //       )}
          //   //     </button>
          //   //     <button
          //   //       type="button"
          //   //       onClick={() => handleDelete(row)}
          //   //       className="p-2 rounded-lg border border-slate-200 hover:border-rose-200 hover:text-rose-600 transition-colors"
          //   //     >
          //   //       <Trash2 size={16} />
          //   //     </button>
          //   //   </div>
          //   // ),
          // },
        ]}
        formFields={[
          { name: "code", label: "Coupon Code", colSpan: 2 },
          {
            name: "discount_type",
            label: "Discount Type",

            type: "select",
            required: true,
            options: [
              { id: "percentage", name: "Percentage" },
              { id: "fixed", name: "Fixed Amount" },
            ],
            optionValue: "id",
          },
          {
            name: "discount_value",
            label: "Discount Value",
            colSpan: 2,
            type: "number",
            required: true,
            step: "0.01",
          },
          {
            name: "min_order_amount",
            label: "Min Order Amount",
            type: "number",
            step: "0.01",
          },
          {
            name: "max_discount_amount",
            label: "Max Discount",
            type: "number",
            step: "0.01",
          },

          {
            name: "total_usage_limit",
            label: "Total Usage Limit",
            type: "number",
          },
          {
            name: "valid_from",
            label: "Valid From",
            type: "date",
            required: true,
          },
          {
            name: "valid_to",
            label: "Valid To",
            type: "date",
            required: true,
          },
          {
            name: "description",
            label: "Description",
            type: "textarea",
            colSpan: 2,
          },
        ]}
        preparePayload={(form) => ({
          ...form,
          discount_value: Number(form.discount_value),
          min_order_amount: Number(form.min_order_amount) || 0,
          max_discount_amount: form.max_discount_amount
            ? Number(form.max_discount_amount)
            : null,

          total_usage_limit: form.total_usage_limit
            ? Number(form.total_usage_limit)
            : null,
        })}
      />
      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewData(null);
        }}
        title={
          viewData?.coupon?.code
            ? `Coupon: ${viewData.coupon.code}`
            : "Coupon Details"
        }
        wide
      >
        {viewLoading ? (
          <div className="p-8 flex items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading...
          </div>
        ) : viewData ? (
          <div className="p-4 md:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Discount
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {viewData.coupon.discount_value}
                  {viewData.coupon.discount_type === "percentage"
                    ? "%"
                    : " INR"}{" "}
                  {viewData.coupon.discount_type === "percentage"
                    ? "off"
                    : "off"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Status
                </p>
                <StatusBadge
                  status={
                    viewData.coupon.coupon_status ||
                    (viewData.coupon.is_active ? "active" : "inactive")
                  }
                />
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Used / Limit
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {viewData.usage_summary.total_used} /{" "}
                  {viewData.usage_summary.total_usage_limit || "∞"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Remaining
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {viewData.coupon.remaining_usage ?? "∞"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Unique Users
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {viewData.usage_summary.unique_users}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Discount Given
                </p>
                <p className="text-lg font-bold text-slate-900">
                  ₹
                  {viewData.usage_summary.total_discount_given.toLocaleString()}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Min Order
                </p>
                <p className="text-lg font-bold text-slate-900">
                  ₹{viewData.coupon.min_order_amount}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Max Discount
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {viewData.coupon.max_discount_amount
                    ? `₹${viewData.coupon.max_discount_amount}`
                    : "∞"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Per User Limit
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {viewData.coupon.usage_limit_per_user}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Type
                </p>
                <p className="text-lg font-bold text-slate-900 capitalize">
                  {viewData.coupon.discount_type}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 col-span-2">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Valid Period
                </p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(viewData.coupon.valid_from).toLocaleString()} –{" "}
                  {new Date(viewData.coupon.valid_to).toLocaleString()}
                </p>
              </div>
            </div>

            {viewData.coupon.description && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Description
                </h4>
                <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4">
                  {viewData.coupon.description}
                </p>
              </div>
            )}

            {viewData.used_by.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Usage by Users
                </h4>
                <div className="space-y-4">
                  {viewData.used_by.map((user) => (
                    <div
                      key={user.user_id}
                      className="bg-slate-50 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-800">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {user.email} | {user.phone}
                          </p>
                        </div>
                        <div className="text-right text-xs text-slate-500">
                          <p>{user.total_orders} order(s)</p>
                          <p>
                            ₹{user.total_order_amount.toLocaleString()} total
                          </p>
                          <p className="text-green-600 font-medium">
                            ₹{user.total_discount_received.toLocaleString()}{" "}
                            saved
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {user.orders.map((o) => (
                          <div
                            key={o.order_id}
                            className="bg-white rounded-lg border border-slate-100 overflow-hidden"
                          >
                            <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                              <span className="font-medium text-slate-700 text-xs">
                                Order #{o.order_id}
                              </span>
                              <div className="flex items-center gap-2">
                                <StatusBadge status={o.order_status} />
                                <span className="text-xs text-slate-400">
                                  {new Date(
                                    o.coupon_used_at,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="px-3 py-2 space-y-1">
                              {o.products.map((p) => (
                                <div
                                  key={p.order_item_id}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <span className="font-medium text-slate-700">
                                      {p.product_name}
                                    </span>
                                    {p.sku && (
                                      <span className="text-slate-400 ml-1">
                                        ({p.sku})
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 text-slate-500">
                                    <span>x{p.quantity}</span>
                                    <span>₹{p.unit_price}</span>
                                    <span className="font-medium text-slate-700">
                                      ₹{p.total_price}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-t border-slate-100 text-xs">
                              <span className="text-slate-500">
                                Payment: {o.payment_method} | {o.payment_status}
                              </span>
                              <span className="text-slate-500">
                                Discount: -₹{o.discount_amount} |{" "}
                                <span className="font-medium text-slate-700">
                                  Total: ₹{o.total_amount}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewData.used_by.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-6">
                No usage history yet.
              </p>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            Failed to load coupon details.
          </div>
        )}
      </Modal>
    </>
  );
}
