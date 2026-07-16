import CrudPage from "../../components/shared/CrudPage";
import {
  getShippingCosts,
  createShippingCost,
  getShippingCostById,
  updateShippingCost,
  updateShippingCostStatus,
  deleteShippingCost,
} from "../../api/shippingCost";
import { useEffect, useState } from "react";
import Select from "react-select";

const defaultForm = {
  state: "",
  shipping_cost: "",
  estimated_delivery_days: "",
  status: "active",
};

function ShippingCostFilters({ filterState, setFilterState }) {
  const [searchInput, setSearchInput] = useState(filterState.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filterState.search) {
        setFilterState((prev) => ({ ...prev, search: searchInput }));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="flex items-center gap-3">
      <input
        type="text"
        placeholder="Search by state..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="px-3 py-2 rounded-xl border border-slate-200 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
      <Select
        options={statusOptions}
        value={statusOptions.find(
          (option) => option.value === (filterState.status || ""),
        )}
        onChange={(selected) =>
          setFilterState((prev) => ({
            ...prev,
            status: selected ? selected.value : "",
          }))
        }
        isClearable
        isSearchable={false}
        placeholder="All statuses"
        className="min-w-[160px] text-sm"
        classNamePrefix="react-select"
      />
    </div>
  );
}

export default function ShippingCostsPage() {
  const handleToggleStatus = async (id) => {
    const res = await getShippingCostById(id);
    const currentStatus = res.data?.status;
    if (!currentStatus) return;
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await updateShippingCostStatus(id, { status: newStatus });
  };

  return (
    <CrudPage
      title="Shipping Costs"
      description="Manage shipping costs by state"
      idKey="id"
      defaultForm={defaultForm}
      fetchList={(page, filters) =>
        getShippingCosts({
          page,
          limit: 10,
          search: filters.search || "",
          status: filters.status || "",
        }).then((res) => ({
          ...res,
          pagination: {
            ...res.pagination,
            totalPages: res.pagination?.total_pages,
          },
        }))
      }
      createItem={createShippingCost}
      updateItem={updateShippingCost}
      deleteItem={deleteShippingCost}
      toggleStatus={handleToggleStatus}
      deleteEntityLabel="Shipping Cost"
      FilterComponent={ShippingCostFilters}
      columns={[
        { key: "no", label: "#" },
        { key: "state", label: "State" },
        {
          key: "shipping_cost",
          label: "Cost",
          render: (r) => `₹${Number(r.shipping_cost).toLocaleString("en-IN")}`,
        },
        {
          key: "estimated_delivery_days",
          label: "Delivery Days",
          render: (r) => r.estimated_delivery_days || "—",
        },
        { key: "status", label: "Status" },
      ]}
      formFields={[
        { name: "state", label: "State", required: true, colSpan: 2 },
        {
          name: "shipping_cost",
          label: "Shipping Cost (₹)",
          type: "number",
          required: true,
        },
        {
          name: "estimated_delivery_days",
          label: "Estimated Delivery Days",
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { id: "active", name: "Active" },
            { id: "inactive", name: "Inactive" },
          ],
          optionValue: "id",
        },
      ]}
    />
  );
}
