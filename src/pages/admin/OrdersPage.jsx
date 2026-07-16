// import { useEffect, useState } from "react";
// import CrudPage from "../../components/shared/CrudPage";
// import Modal from "../../components/shared/Modal";
// import { getAllOrders, updateOrderStatus } from "../../api/orders";
// import Select from "react-select";
// import { IndianRupee } from "lucide-react";

// const ORDER_STATUSES = [
//   { value: "", label: "Clear Select" },
//   { value: "pending", label: "PENDING" },
//   // { value: "confirmed", label: "CONFIRMED" },
//   { value: "processing", label: "PROCESSING" },
//   { value: "shipped", label: "SHIPPED" },
//   { value: "delivered", label: "DELLIVERED" },
//   { value: "cancelled", label: "CANCELLED" },
//   { value: "returned", label: "RETURNED" },
// ];

// function OrderFilter({ filterState, setFilterState }) {
//   const statusOptions = ORDER_STATUSES;
//   return (
//     <div className="flex  items-center gap-3 flex-wrap">
//       <div className="flex flex-col gap-3 items-center ">
//         <span className="text-sm ">Select Status</span>
//         <Select
//           options={statusOptions}
//           value={statusOptions.find(
//             (option) => option.value === (filterState.status || "Chose"),
//           )}
//           onChange={(selected) =>
//             setFilterState((prev) => ({
//               ...prev,
//               status: selected.value,
//             }))
//           }
//           isSearchable={false}
//           className="min-w-[180px] text-sm"
//           classNamePrefix="react-select"
//         />
//       </div>

//       <div className="flex flex-col gap-3 items-center ">
//         <span className="text-sm "> From Date</span>
//         <input
//           type="date"
//           value={filterState.from_date || ""}
//           onChange={(e) =>
//             setFilterState((prev) => ({ ...prev, from_date: e.target.value }))
//           }
//           className="w-40 h-12 px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
//           title="From date"
//         />
//       </div>
//       <div className="flex flex-col gap-3 items-center ">
//         <span className="text-sm "> To Date</span>
//         <input
//           type="date"
//           value={filterState.to_date || ""}
//           onChange={(e) =>
//             setFilterState((prev) => ({ ...prev, to_date: e.target.value }))
//           }
//           className="w-40 h-12  px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
//           title="To date"
//         />
//       </div>
//     </div>
//   );
// }
// export default function OrdersPage() {
//   const [statusModal, setStatusModal] = useState(null);
//   const [detailModal, setDetailModal] = useState(null);
//   const [statusForm, setStatusForm] = useState({
//     order_status: "",
//     admin_notes: "",
//   });
//   const [refreshKey, setRefreshKey] = useState(0);
//   const [updatingRows, setUpdatingRows] = useState({});
//   const handleStatusChange = async (orderId, newStatus) => {
//     setUpdatingRows((prev) => ({ ...prev, [orderId]: true }));
//     try {
//       await updateOrderStatus(orderId, { order_status: newStatus });
//       setRefreshKey((k) => k + 1);
//     } catch {
//     } finally {
//       setUpdatingRows((prev) => ({ ...prev, [orderId]: false }));
//     }
//   };
//   return (
//     <>
//       <CrudPage
//         key={refreshKey}
//         title="Orders"
//         description="View and update order status"
//         idKey="id"
//         canCreate={false}
//         canDelete={false}
//         FilterComponent={OrderFilter}
//         fetchList={(page, filters) =>
//           getAllOrders({
//             page,
//             limit: 10,
//             status: filters.status || "",
//             search: filters.search || "",
//             from_date: filters.from_date || "",
//             to_date: filters.to_date || "",
//           })
//         }
//         onEditRow={(row) => {
//           setStatusForm({
//             order_status: row.order_status,
//             admin_notes: row.admin_notes || "",
//           });
//           setStatusModal(row);
//         }}
//         columns={[
//           { key: "no", label: "Order Sr" },
//           { key: "customer_name", label: "Customer" },
//           {
//             key: "phone",
//             label: "Customer Phone",
//             render: (r) => ` ${r.billing_phone}`,
//           },
//           {
//             key: "shipping_address",
//             label: "Full Shipping Address",
//             render: (r) => `${r.shipping_address.full_address}`,
//           },
//           {
//             key: "order_date",
//             label: "Date",
//             render: (r) => new Date(r.order_date).toLocaleDateString(),
//           },
//           {
//             key: "total_amount",
//             label: "Total in (Rupee)",
//             render: (r) => ` ${parseFloat(r.total_amount).toFixed(2)}`,
//           },
//           {
//             key: "order_status",
//             label: "Status",
//             render: (r) => (
//               <span onClick={(e) => e.stopPropagation()}>
//                 <Select
//                   options={ORDER_STATUSES}
//                   value={ORDER_STATUSES.find((o) => o.value === r.order_status)}
//                   onChange={(selected) =>
//                     selected && handleStatusChange(r.id, selected.value)
//                   }
//                   isDisabled={updatingRows[r.id]}
//                   isSearchable={false}
//                   className="min-w-[140px] text-xs"
//                   classNamePrefix="react-select"
//                   styles={{
//                     control: (base) => ({
//                       ...base,
//                       minHeight: 28,
//                       borderRadius: 8,
//                       border: "none",
//                       boxShadow: "none",
//                       cursor: "pointer",
//                       backgroundColor:
//                         r.order_status === "delivered"
//                           ? "#dcfce7"
//                           : r.order_status === "cancelled"
//                             ? "#fee2e2"
//                             : r.order_status === "pending"
//                               ? "#fef9c3"
//                               : r.order_status === "shipped"
//                                 ? "#dbeafe"
//                                 : r.order_status === "refunded"
//                                   ? "#f3e8ff"
//                                   : "#f3f4f6",
//                     }),
//                     valueContainer: (base) => ({
//                       ...base,
//                       padding: "0 4px",
//                     }),
//                     singleValue: (base) => ({
//                       ...base,
//                       fontSize: 12,
//                       fontWeight: 600,
//                       margin: 0,
//                       color:
//                         r.order_status === "delivered"
//                           ? "#15803d"
//                           : r.order_status === "cancelled"
//                             ? "#b91c1c"
//                             : r.order_status === "pending"
//                               ? "#a16207"
//                               : r.order_status === "shipped"
//                                 ? "#1d4ed8"
//                                 : r.order_status === "refunded"
//                                   ? "#7e22ce"
//                                   : "#374151",
//                     }),
//                     dropdownIndicator: (base) => ({
//                       ...base,
//                       padding: "0 2px",
//                     }),
//                     indicatorSeparator: () => ({ display: "none" }),
//                     menu: (base) => ({
//                       ...base,
//                       zIndex: 9999,
//                     }),
//                   }}
//                 />
//               </span>
//             ),
//           },
//           {
//             key: "payment_status",
//             label: "Payment",
//             render: (r) => (
//               <span
//                 className={`px-2 py-1 rounded-full text-xs font-medium Rs- ${
//                   r.payment_status === "paid"
//                     ? "bg-green-100 text-green-700"
//                     : r.payment_status === "pending"
//                       ? "bg-yellow-100 text-yellow-700"
//                       : r.payment_status === "failed"
//                         ? "bg-red-100 text-red-700"
//                         : "bg-purple-100 text-purple-700"
//                 }`}
//               >
//                 {r.payment_status}
//               </span>
//             ),
//           },
//           {
//             key: "actions",
//             label: "Actions",
//             render: (r) => (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation(); // Prevent row click from interfering
//                   setDetailModal(r);
//                 }}
//                 className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
//               >
//                 View Details
//               </button>
//             ),
//           },
//         ]}
//         formFields={[]}
//       />

//       {/* Order Details Modal */}
//       <Modal
//         open={!!detailModal}
//         onClose={() => setDetailModal(null)}
//         title={`Order  Details`}
//         wide="large"
//       >
//         {detailModal && (
//           <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
//             {/* Customer Details */}
//             <div>
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
//                 Customer Details
//               </h4>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="text-gray-500">Name:</span>{" "}
//                   <span className="font-medium">
//                     {detailModal.customer_name}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Email:</span>{" "}
//                   <span className="font-medium">
//                     {detailModal.customer_email}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Phone:</span>{" "}
//                   <span className="font-medium">
//                     {detailModal.customer_phone}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Role:</span>{" "}
//                   <span className="font-medium">
//                     {detailModal.customer_role}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             {/* Order Items */}
//             <div>
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
//                 Order Items ({detailModal.items?.length || 0})
//               </h4>
//               <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                 <table className="min-w-full divide-y divide-gray-200">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                         Product
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                         SKU
//                       </th>
//                       <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
//                         Variation
//                       </th>
//                       <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
//                         Qty
//                       </th>
//                       <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
//                         Price
//                       </th>
//                       <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
//                         Total
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200">
//                     {detailModal.items?.map((item) => (
//                       <tr key={item.id}>
//                         <td className="px-4 py-3 text-sm">
//                           <div>
//                             <div className="font-medium">
//                               {item.product?.name ||
//                                 item.product?.snapshot?.product_name}
//                             </div>
//                             {item.product?.snapshot && (
//                               <div className="text-xs text-gray-500">
//                                 {item.product.snapshot.product_name}
//                               </div>
//                             )}
//                           </div>
//                         </td>
//                         <td className="px-4 py-3 text-sm text-gray-600">
//                           {item.product?.sku ||
//                             item.product?.snapshot?.sku ||
//                             "-"}
//                         </td>
//                         <td className="px-4 py-3 text-sm text-gray-600">
//                           {item.product?.variation ||
//                             item.product?.snapshot?.variation ||
//                             "-"}
//                         </td>
//                         <td className="px-4 py-3 text-sm text-right">
//                           {item.quantity}
//                         </td>
//                         <td className="px-4 py-3 text-sm text-right">
//                           Rs- {parseFloat(item.unit_price).toFixed(2)}
//                         </td>
//                         <td className="px-4 py-3 text-sm text-right font-medium">
//                           Rs- {parseFloat(item.total_price).toFixed(2)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-gray-50">
//                     <tr>
//                       <td colSpan="5" className="px-4 py-2 text-right text-sm">
//                         Subtotal:
//                       </td>
//                       <td className="px-4 py-2 flex items-center justify-end text-right text-sm">
//                         <IndianRupee size={12} />{" "}
//                         {parseFloat(detailModal.subtotal).toFixed(2)}
//                       </td>
//                     </tr>
//                     {parseFloat(detailModal.shipping_cost) > 0 && (
//                       <tr>
//                         <td
//                           colSpan="5"
//                           className="px-4 py-2 text-right text-sm text-gray-600"
//                         >
//                           Shipping:
//                         </td>
//                         <td className="px-4 py-2 flex items-center gap-3 justify-end text-right text-sm">
//                           <IndianRupee size={12} />{" "}
//                           {parseFloat(detailModal.shipping_cost).toFixed(2)}
//                         </td>
//                       </tr>
//                     )}
//                     {parseFloat(detailModal.tax_amount) > 0 && (
//                       <tr>
//                         <td
//                           colSpan="5"
//                           className="px-4 py-2 text-right text-sm text-gray-600"
//                         >
//                           Tax:
//                         </td>
//                         <td className="px-4 py-2 text-right text-sm">
//                           Rs- {parseFloat(detailModal.tax_amount).toFixed(2)}
//                         </td>
//                       </tr>
//                     )}
//                     {parseFloat(detailModal.discount_amount) > 0 && (
//                       <tr>
//                         <td
//                           colSpan="5"
//                           className="px-4 py-2 text-right text-sm text-green-600"
//                         >
//                           Discount:
//                         </td>
//                         <td className="px-4 py-2 text-right text-sm text-green-600">
//                           -Rs-{" "}
//                           {parseFloat(detailModal.discount_amount).toFixed(2)}
//                         </td>
//                       </tr>
//                     )}
//                     <tr className="border-t-2 border-gray-300">
//                       <td
//                         colSpan="5"
//                         className="px-4 py-3 text-right text-sm font-bold"
//                       >
//                         Total:
//                       </td>
//                       <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600">
//                         Rs- {parseFloat(detailModal.total_amount).toFixed(2)}
//                       </td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </div>
//             {/* Order Status */}
//             <div>
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
//                 Order Status
//               </h4>
//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <span className="text-gray-500">Order Status:</span>{" "}
//                   <span className="font-medium capitalize">
//                     {detailModal.order_status}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Payment Status:</span>{" "}
//                   <span className="font-medium capitalize">
//                     {detailModal.payment_status}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Payment Method:</span>{" "}
//                   <span className="font-medium capitalize">
//                     {detailModal.payment_method}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Order Date:</span>{" "}
//                   <span className="font-medium">
//                     {new Date(detailModal.order_date).toLocaleString()}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             {/* Shipping Address */}
//             <div>
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
//                 Shipping Address
//               </h4>
//               <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
//                 <p className="font-medium">{detailModal.shipping_full_name}</p>
//                 <p className="text-gray-600">{detailModal.shipping_phone}</p>
//                 <p className="text-gray-600">{detailModal.shipping_line1}</p>
//                 {detailModal.shipping_line2 && (
//                   <p className="text-gray-600">{detailModal.shipping_line2}</p>
//                 )}
//                 {detailModal.shipping_landmark && (
//                   <p className="text-gray-600">
//                     Landmark: {detailModal.shipping_landmark}
//                   </p>
//                 )}
//                 <p className="text-gray-600">
//                   {detailModal.shipping_city}, {detailModal.shipping_state}{" "}
//                   {detailModal.shipping_postal_code}
//                 </p>
//                 <p className="text-gray-600">{detailModal.shipping_country}</p>
//               </div>
//             </div>

//             {/* Billing Address */}
//             <div>
//               <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
//                 Billing Address
//               </h4>
//               <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
//                 <p className="font-medium">{detailModal.billing_full_name}</p>
//                 <p className="text-gray-600">{detailModal.billing_phone}</p>
//                 <p className="text-gray-600">{detailModal.billing_line1}</p>
//                 {detailModal.billing_line2 && (
//                   <p className="text-gray-600">{detailModal.billing_line2}</p>
//                 )}
//                 {detailModal.billing_landmark && (
//                   <p className="text-gray-600">
//                     Landmark: {detailModal.billing_landmark}
//                   </p>
//                 )}
//                 <p className="text-gray-600">
//                   {detailModal.billing_city}, {detailModal.billing_state}{" "}
//                   {detailModal.billing_postal_code}
//                 </p>
//                 <p className="text-gray-600">{detailModal.billing_country}</p>
//               </div>
//             </div>

//             {/* Admin Notes */}
//             {detailModal.admin_notes && (
//               <div>
//                 <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
//                   Admin Notes
//                 </h4>
//                 <div className="text-sm bg-yellow-50 p-4 rounded-lg border border-yellow-200">
//                   {detailModal.admin_notes}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </Modal>

//       {/* Update Status Modal */}
//       <Modal
//         open={!!statusModal}
//         onClose={() => setStatusModal(null)}
//         title={`Update Order #Rs- {statusModal?.id}`}
//       >
//         <form
//           className="p-6 space-y-4"
//           onSubmit={async (e) => {
//             e.preventDefault();
//             await updateOrderStatus(statusModal.id, statusForm);
//             setStatusModal(null);
//             setRefreshKey((k) => k + 1);
//           }}
//         >
//           <div>
//             <label className="text-xs font-semibold uppercase text-slate-500">
//               Order Status
//             </label>

//             <Select
//               options={ORDER_STATUSES}
//               value={ORDER_STATUSES.find(
//                 (option) => option.value === statusForm.order_status,
//               )}
//               onChange={(selected) =>
//                 setStatusForm({
//                   ...statusForm,
//                   order_status: selected.value,
//                 })
//               }
//               isSearchable={false}
//               className="mt-1"
//               classNamePrefix="react-select"
//             />
//           </div>
//           <div>
//             <label className="text-xs font-semibold uppercase text-slate-500">
//               Admin Notes
//             </label>
//             <textarea
//               rows={3}
//               value={statusForm.admin_notes}
//               onChange={(e) =>
//                 setStatusForm({ ...statusForm, admin_notes: e.target.value })
//               }
//               className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
//               placeholder="Add notes about this order..."
//             />
//           </div>
//           <button
//             type="submit"
//             className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
//           >
//             Update Status
//           </button>
//         </form>
//       </Modal>
//     </>
//   );
// }

import { useEffect, useState } from "react";
import CrudPage from "../../components/shared/CrudPage";
import Modal from "../../components/shared/Modal";
import { getAllOrders, updateOrderStatus } from "../../api/orders";
import {
  getShipments,
  getShipmentById as getShipment,
  createShipment,
  addTrackingEvent,
  updateShipmentStatus,
} from "../../api/shipments";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Select from "react-select";

const ORDER_STATUSES = [
  { value: "pending", label: "PENDING" },
  // { value: "confirmed", label: "CONFIRMED" },
  { value: "processing", label: "PROCESSING" },
  { value: "shipped", label: "SHIPPED" },
  { value: "delivered", label: "DELLIVERED" },
  { value: "cancelled", label: "CANCELLED" },
  { value: "returned", label: "RETURNED" },
];

function OrderFilter({ filterState, setFilterState }) {
  const statusOptions = ORDER_STATUSES;
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        options={statusOptions}
        value={statusOptions.find(
          (option) => option.value === (filterState.status || "Chose"),
        )}
        onChange={(selected) =>
          setFilterState((prev) => ({
            ...prev,
            status: selected.value,
          }))
        }
        isSearchable={false}
        className="min-w-[180px] text-sm"
        classNamePrefix="react-select"
      />
      <input
        type="date"
        value={filterState.from_date || ""}
        onChange={(e) =>
          setFilterState((prev) => ({ ...prev, from_date: e.target.value }))
        }
        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        title="From date"
      />
      <input
        type="date"
        value={filterState.to_date || ""}
        onChange={(e) =>
          setFilterState((prev) => ({ ...prev, to_date: e.target.value }))
        }
        className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
        title="To date"
      />
    </div>
  );
}
export default function OrdersPage() {
  const [statusModal, setStatusModal] = useState(null);
  const [detailModal, setDetailModal] = useState(null);
  const [statusForm, setStatusForm] = useState({
    order_status: "",
    admin_notes: "",
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingRows, setUpdatingRows] = useState({});

  // Tracking state
  const [shipment, setShipment] = useState(null);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [creatingShipment, setCreatingShipment] = useState(false);
  const [addingEvent, setAddingEvent] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    event: "",
    timestamp: "",
  });

  const trackingHistory = (shipment?.tracking_history || []).flatMap((item) => {
    try {
      return JSON.parse(item);
    } catch {
      return item;
    }
  });

  const loadShipmentForOrder = async (orderId) => {
    setShipmentLoading(true);
    try {
      const res = await getShipments({ limit: 100 });
      const found = (res?.data || []).find(
        (s) => String(s.order_id) === String(orderId),
      );
      if (found) {
        const full = await getShipment(found.id);
        setShipment(full?.data || full);
      } else {
        setShipment(null);
      }
    } catch {
      setShipment(null);
    } finally {
      setShipmentLoading(false);
    }
  };

  useEffect(() => {
    if (!statusModal) {
      setShipment(null);
      return;
    }
    loadShipmentForOrder(statusModal.id);
  }, [statusModal]);

  useEffect(() => {
    if (!detailModal) {
      return;
    }
    loadShipmentForOrder(detailModal.id);
  }, [detailModal]);

  const handleCreateShipment = async () => {
    const order = detailModal || statusModal;
    if (!order) return;
    setCreatingShipment(true);
    try {
      const payload = {
        order_id: order.id,
        carrier: "",
        recipient_address: [
          order.shipping_line1,
          order.shipping_line2,
          order.shipping_city,
          order.shipping_state,
          order.shipping_postal_code,
        ]
          .filter(Boolean)
          .join(", "),
        status: "pending",
        customer_name: order.customer_name,
        customer_phone: order.customer_phone || order.billing_phone,
        customer_email: order.customer_email,
      };
      const res = await createShipment(payload);
      const full = await getShipment(res?.data?.id || res?.id);
      setShipment(full?.data || full);
    } catch {
    } finally {
      setCreatingShipment(false);
    }
  };

  const handleQuickTrackingEvent = async (eventName) => {
    const orderId = detailModal?.id || statusModal?.id;
    if (!shipment?.id || !orderId) return;
    setAddingEvent(true);
    try {
      // await updateShipmentStatus(shipment.id, eventName);
    } catch {}
    try {
      await updateOrderStatus(orderId, { order_status: eventName });
    } catch {}
    try {
      const full = await getShipment(shipment.id);
      setShipment(full?.data || full);
    } catch {
    } finally {
      setAddingEvent(false);
    }
  };

  const handleCustomTrackingEvent = async () => {
    if (!shipment?.id || !trackingForm.event || !trackingForm.timestamp) return;
    setAddingEvent(true);
    try {
      const json = {
        event: [
          {
            event: trackingForm.event,
            timestamp: String(trackingForm.timestamp),
          },
        ],
      };
      await addTrackingEvent(shipment.id, JSON.stringify(json));
      const full = await getShipment(shipment.id);
      setShipment(full?.data || full);
      setTrackingForm({ event: "", timestamp: "" });
    } catch {
    } finally {
      setAddingEvent(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingRows((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, { order_status: newStatus });
      setRefreshKey((k) => k + 1);
    } catch {
    } finally {
      setUpdatingRows((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  return (
    <>
      <CrudPage
        key={refreshKey}
        title="Orders"
        description="View and update order status"
        idKey="id"
        canCreate={false}
        canDelete={false}
        FilterComponent={OrderFilter}
        fetchList={(page, filters) =>
          getAllOrders({
            page,
            limit: 10,
            status: filters.status || "",
            search: filters.search || "",
            from_date: filters.from_date || "",
            to_date: filters.to_date || "",
          })
        }
        onEditRow={(row) => {
          setStatusForm({
            order_status: row.order_status,
            admin_notes: row.admin_notes || "",
          });
          setStatusModal(row);
        }}
        columns={[
          { key: "no", label: "Order Sr" },
          { key: "customer_name", label: "Customer" },
          {
            key: "phone",
            label: "Customer Phone",
            render: (r) => ` ${r.billing_phone}`,
          },
          {
            key: "shipping_address",
            label: "Full Shipping Address",
            render: (r) => `${r.shipping_address.full_address}`,
          },
          {
            key: "order_date",
            label: "Date",
            render: (r) => new Date(r.order_date).toLocaleDateString(),
          },
          {
            key: "total_amount",
            label: "Total in (Rupee)",
            render: (r) => ` ${parseFloat(r.total_amount).toFixed(2)}`,
          },
          {
            key: "order_status",
            label: "Status",
            render: (r) => (
              <span onClick={(e) => e.stopPropagation()}>
                <Select
                  options={ORDER_STATUSES}
                  value={ORDER_STATUSES.find((o) => o.value === r.order_status)}
                  onChange={(selected) =>
                    selected && handleStatusChange(r.id, selected.value)
                  }
                  isDisabled={updatingRows[r.id]}
                  isSearchable={false}
                  className="min-w-[140px] text-xs"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: 28,
                      borderRadius: 8,
                      border: "none",
                      boxShadow: "none",
                      cursor: "pointer",
                      backgroundColor:
                        r.order_status === "delivered"
                          ? "#dcfce7"
                          : r.order_status === "cancelled"
                            ? "#fee2e2"
                            : r.order_status === "pending"
                              ? "#fef9c3"
                              : r.order_status === "shipped"
                                ? "#dbeafe"
                                : r.order_status === "refunded"
                                  ? "#f3e8ff"
                                  : "#f3f4f6",
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "0 4px",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: 12,
                      fontWeight: 600,
                      margin: 0,
                      color:
                        r.order_status === "delivered"
                          ? "#15803d"
                          : r.order_status === "cancelled"
                            ? "#b91c1c"
                            : r.order_status === "pending"
                              ? "#a16207"
                              : r.order_status === "shipped"
                                ? "#1d4ed8"
                                : r.order_status === "refunded"
                                  ? "#7e22ce"
                                  : "#374151",
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      padding: "0 2px",
                    }),
                    indicatorSeparator: () => ({ display: "none" }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              </span>
            ),
          },
          {
            key: "payment_status",
            label: "Payment",
            render: (r) => (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  r.payment_status === "paid"
                    ? "bg-green-100 text-green-700"
                    : r.payment_status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : r.payment_status === "failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
                }`}
              >
                {r.payment_status}
              </span>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDetailModal(r);
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                View Details
              </button>
            ),
          },
        ]}
        formFields={[]}
      />

      {/* Order Details Modal */}
      <Modal
        open={!!detailModal}
        onClose={() => setDetailModal(null)}
        title={`Order  Details`}
        wide="large"
      >
        {detailModal && (
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Tracking Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                Tracking
              </h4>

              {shipmentLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-4">
                  <Loader2 size={16} className="animate-spin" /> Loading
                  tracking...
                </div>
              ) : shipment ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    Shipment
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        shipment.current_status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : shipment.current_status === "in_transit" ||
                              shipment.current_status === "out_for_delivery"
                            ? "bg-blue-100 text-blue-700"
                            : shipment.current_status === "failed" ||
                                shipment.current_status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {shipment.current_status?.replace(/_/g, " ")}
                    </span>
                  </div>

                  {/* Tracking Timeline */}
                  {trackingHistory.length > 0 && (
                    <div className="flex gap-1 overflow-x-auto pb-2">
                      {trackingHistory.map((event, i) => {
                        const isLast = i === trackingHistory.length - 1;
                        return (
                          <div
                            key={i}
                            className="flex items-start min-w-[140px]"
                          >
                            <div className="flex flex-col items-center w-full">
                              <div
                                className={`w-3 h-3 rounded-full ${isLast ? "bg-indigo-600" : "bg-indigo-300"}`}
                              />
                              <div
                                className={`mt-2 p-2 rounded-lg border text-xs w-full ${
                                  isLast
                                    ? "bg-white border-indigo-200"
                                    : "bg-slate-50 border-slate-200"
                                }`}
                              >
                                <p className="font-medium text-slate-800">
                                  {event.event}
                                </p>
                                <p className="text-slate-400 text-[10px] mt-0.5">
                                  {event.date
                                    ? new Date(event.date).toLocaleDateString()
                                    : ""}
                                </p>
                              </div>
                            </div>
                            {!isLast && (
                              <div className="w-6 h-[2px] mt-[5px] bg-indigo-200 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick Tracking Buttons */}
                  <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      Quick Tracking Events
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        {
                          id: "pending",
                          label: "PENDING",
                          color: "bg-amber-500 hover:bg-amber-600",
                        },
                        {
                          id: "processing",
                          label: "PROCESSING",
                          color: "bg-blue-500 hover:bg-blue-600",
                        },
                        {
                          id: "shipped",
                          label: "SHIPPED",
                          color: "bg-indigo-500 hover:bg-indigo-600",
                        },
                        {
                          id: "delivered",
                          label: "DELLIVERED",
                          color: "bg-emerald-500 hover:bg-emerald-600",
                        },
                        {
                          id: "cancelled",
                          label: "Cancelled",
                          color: "bg-red-500 hover:bg-red-600",
                        },
                        {
                          id: "returned",
                          label: "Returned",
                          color: "bg-orange-500 hover:bg-orange-600",
                        },

                        {
                          id: "returned",
                          label: "RETURNED",
                          color: "bg-indigo-500 hover:bg-indigo-300",
                        },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          type="button"
                          onClick={() => handleQuickTrackingEvent(btn.id)}
                          disabled={addingEvent}
                          className={`px-2.5 py-1 rounded-lg text-white text-[11px] font-medium transition-all disabled:opacity-50 ${btn.color}`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Event */}
                  {/* <div>
                    <p className="text-xs font-medium text-slate-600 mb-2">
                      Custom Event
                    </p>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        placeholder="Event name"
                        value={trackingForm.event}
                        onChange={(e) =>
                          setTrackingForm((p) => ({
                            ...p,
                            event: e.target.value,
                          }))
                        }
                      />
                      <input
                        type="date"
                        className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        value={trackingForm.timestamp}
                        onChange={(e) =>
                          setTrackingForm((p) => ({
                            ...p,
                            timestamp: e.target.value,
                          }))
                        }
                      />
                      <button
                        type="button"
                        onClick={handleCustomTrackingEvent}
                        disabled={
                          addingEvent ||
                          !trackingForm.event ||
                          !trackingForm.timestamp
                        }
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {addingEvent ? "..." : "Add"}
                      </button>
                    </div>
                  </div> */}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-400 mb-3">
                    No shipment linked to this order.
                  </p>
                  <button
                    type="button"
                    onClick={handleCreateShipment}
                    disabled={creatingShipment}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creatingShipment ? "Creating..." : "Create Shipment"}
                  </button>
                </div>
              )}
            </div>
            {/* Customer Details */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                Customer Details
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-medium">
                    {detailModal.customer_name}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>{" "}
                  <span className="font-medium">
                    {detailModal.customer_email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Phone:</span>{" "}
                  <span className="font-medium">
                    {detailModal.customer_phone}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Role:</span>{" "}
                  <span className="font-medium">
                    {detailModal.customer_role}
                  </span>
                </div>
              </div>
            </div>
            {/* Order Items */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                Order Items ({detailModal.items?.length || 0})
              </h4>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Variation
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Qty
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Price
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {detailModal.items?.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">
                          <div>
                            <div className="font-medium">
                              {item.product?.name ||
                                item.product?.snapshot?.product_name}
                            </div>
                            {item.product?.snapshot && (
                              <div className="text-xs text-gray-500">
                                {item.product.snapshot.product_name}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.product?.sku ||
                            item.product?.snapshot?.sku ||
                            "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {item.product?.variation ||
                            item.product?.snapshot?.variation ||
                            "-"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          Rs- {parseFloat(item.unit_price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          Rs- {parseFloat(item.total_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="5" className="px-4 py-2 text-right text-sm">
                        Subtotal:
                      </td>
                      <td className="px-4 py-2 text-right text-sm">
                        Rs- {parseFloat(detailModal.subtotal).toFixed(2)}
                      </td>
                    </tr>
                    {parseFloat(detailModal.shipping_cost) > 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-2 text-right text-sm text-gray-600"
                        >
                          Shipping:
                        </td>
                        <td className="px-4 py-2 text-right text-sm">
                          Rs- {parseFloat(detailModal.shipping_cost).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {parseFloat(detailModal.tax_amount) > 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-2 text-right text-sm text-gray-600"
                        >
                          Tax:
                        </td>
                        <td className="px-4 py-2 text-right text-sm">
                          Rs- {parseFloat(detailModal.tax_amount).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    {parseFloat(detailModal.discount_amount) > 0 && (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-4 py-2 text-right text-sm text-green-600"
                        >
                          Discount:
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-green-600">
                          -Rs-{" "}
                          {parseFloat(detailModal.discount_amount).toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr className="border-t-2 border-gray-300">
                      <td
                        colSpan="5"
                        className="px-4 py-3 text-right text-sm font-bold"
                      >
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600">
                        Rs- {parseFloat(detailModal.total_amount).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            {/* Order Status */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                Order Status
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Order Status:</span>{" "}
                  <span className="font-medium capitalize">
                    {detailModal.order_status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Payment Status:</span>{" "}
                  <span className="font-medium capitalize">
                    {detailModal.payment_status}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Payment Method:</span>{" "}
                  <span className="font-medium capitalize">
                    {detailModal.payment_method}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Order Date:</span>{" "}
                  <span className="font-medium">
                    {new Date(detailModal.order_date).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                Shipping Address
              </h4>
              <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-medium">{detailModal.shipping_full_name}</p>
                <p className="text-gray-600">{detailModal.shipping_phone}</p>
                <p className="text-gray-600">{detailModal.shipping_line1}</p>
                {detailModal.shipping_line2 && (
                  <p className="text-gray-600">{detailModal.shipping_line2}</p>
                )}
                {detailModal.shipping_landmark && (
                  <p className="text-gray-600">
                    Landmark: {detailModal.shipping_landmark}
                  </p>
                )}
                <p className="text-gray-600">
                  {detailModal.shipping_city}, {detailModal.shipping_state}{" "}
                  {detailModal.shipping_postal_code}
                </p>
                <p className="text-gray-600">{detailModal.shipping_country}</p>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                Billing Address
              </h4>
              <div className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-medium">{detailModal.billing_full_name}</p>
                <p className="text-gray-600">{detailModal.billing_phone}</p>
                <p className="text-gray-600">{detailModal.billing_line1}</p>
                {detailModal.billing_line2 && (
                  <p className="text-gray-600">{detailModal.billing_line2}</p>
                )}
                {detailModal.billing_landmark && (
                  <p className="text-gray-600">
                    Landmark: {detailModal.billing_landmark}
                  </p>
                )}
                <p className="text-gray-600">
                  {detailModal.billing_city}, {detailModal.billing_state}{" "}
                  {detailModal.billing_postal_code}
                </p>
                <p className="text-gray-600">{detailModal.billing_country}</p>
              </div>
            </div>

            {/* Admin Notes */}
            {detailModal.admin_notes && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 border-b pb-2">
                  Admin Notes
                </h4>
                <div className="text-sm bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {detailModal.admin_notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        open={!!statusModal}
        onClose={() => setStatusModal(null)}
        title={`Update Order #${statusModal?.id}`}
        wide
      >
        <form
          className="p-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await updateOrderStatus(statusModal.id, statusForm);
            setStatusModal(null);
            setRefreshKey((k) => k + 1);
          }}
        >
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Order Status
            </label>

            <Select
              options={ORDER_STATUSES}
              value={ORDER_STATUSES.find(
                (option) => option.value === statusForm.order_status,
              )}
              onChange={(selected) =>
                setStatusForm({
                  ...statusForm,
                  order_status: selected.value,
                })
              }
              isSearchable={false}
              className="mt-1"
              classNamePrefix="react-select"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">
              Admin Notes
            </label>
            <textarea
              rows={3}
              value={statusForm.admin_notes}
              onChange={(e) =>
                setStatusForm({ ...statusForm, admin_notes: e.target.value })
              }
              className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 text-sm"
              placeholder="Add notes about this order..."
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition"
          >
            Update Status
          </button>
        </form>
      </Modal>
    </>
  );
}
