import CrudPage, { ImageCell } from "../../components/shared/CrudPage";
import {
  getMakes,
  createMake,
  updateMake,
  deleteMake,
  restoreMake,
  toggleMakes,
} from "../../api/vehicles";
import { useEffect, useState } from "react";
import Select from "react-select";
const defaultForm = { name: "", country: "", status: "active" };
function MakeFilters({ filterState, setFilterState }) {
  const [searchInput, setSearchInput] = useState(filterState.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterState((prev) => ({
        ...prev,
        search: searchInput,
      }));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, setFilterState]);

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="w-full border border-zinc-400/30 outline-none rounded-md focus:ring-2 focus:ring-indigo-700 px-4 py-2"
        placeholder="Search"
      />

      <Select
        options={statusOptions}
        value={statusOptions.find(
          (o) => o.value === (filterState.status || "all"),
        )}
        onChange={(selected) =>
          setFilterState((prev) => ({
            ...prev,
            status: selected.value,
          }))
        }
      />
    </div>
  );
}
export default function VehicleMakesPage() {
  return (
    <CrudPage
      title="Vehicle Makes"
      description="Car / truck manufacturers"
      idKey="id"
      fileFields={["logo_url"]}
      defaultForm={defaultForm}
      FilterComponent={MakeFilters}
      fetchList={(page, filters) =>
        getMakes({
          page,
          limit: 10,
          status: filters.status || "all",
          search: filters.search || "",
        })
      }
      createItem={createMake}
      updateItem={updateMake}
      deleteItem={deleteMake}
      toggleStatus={toggleMakes}
      deleteEntityLabel="Vehicle Make"
      deleteChildWarning="associated models and generations"
      restoreItem={restoreMake}
      columns={[
        { key: "no", label: "Serial" },
        {
          key: "name",
          label: "Make",
          render: (row) => (
            <div className="flex items-center sm:flex-row flex-col sm:justify-start justify-end gap-3">
              <ImageCell src={row.logo_url} className="object-contain" />
              <span className="font-medium">{row.name}</span>
            </div>
          ),
        },
        { key: "country", label: "Country" },
        { key: "status", label: "Status" },
      ]}
      formFields={[
        { name: "name", label: "Name", required: true, colSpan: 2 },
        { name: "country", label: "Country" },
        { name: "logo_url", label: "Logo", type: "file" },

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
