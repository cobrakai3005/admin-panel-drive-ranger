import api from "../../config/axios";
import CrudPage, { ImageCell } from "../../components/shared/CrudPage";
import { fetchCategoryOptions, createCategory } from "../../api/categories";
import {
  fetchSubcategoryOptions,
  createSubcategory,
} from "../../api/subcategories";
import { fetchBrandOptions, createBrand } from "../../api/brands";
import {
  getAllProductsApi,
  createProductApi,
  updateProductApi,
  deleteProductApi,
  toggleProductStatusApi,
  restoreProductApi,
  getProductImagesApi,
  deleteProductImageApi,
  reorderProductImagesApi,
} from "../../api/products";
import { useCallback, useState, useEffect, useRef } from "react";
import Select from "react-select";
import {
  fetchMakeOptions,
  fetchModelOptionsByMake,
  fetchGenerationOptionsByModel,
  getCompatibilityByProduct,
  removeCompatibility,
  createMake,
  createModel,
  createGeneration,
} from "../../api/vehicles";

// FIX: Separate filter component - hooks are now called at component top level
function ProductFilters({ filterState, setFilterState }) {
  const [searchInput, setSearchInput] = useState(filterState.search || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilterState((prev) => ({ ...prev, search: searchInput }));
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput, setFilterState]);

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ];
  const sortOptions = [
    { value: "price_low_high", label: "Price: Low to High" },
    { value: "price_high_low", label: "Price: High to Low" },
    { value: "latest", label: "Latest" },
    { value: "oldest", label: "Oldest" },
  ];

  const currentStatus =
    statusOptions.find((opt) => opt.value === (filterState.status || "all")) ||
    statusOptions[0];

  const currentSort =
    sortOptions.find((opt) => opt.value === (filterState.sort || "latest")) ||
    sortOptions[0];

  //#4f46e5
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <input
        type="text"
        placeholder="Search products..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="px-3 py-2 w-full  rounded-xl border border-slate-200 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />

      <Select
        options={sortOptions}
        value={currentSort}
        onChange={(selected) =>
          setFilterState((prev) => ({
            ...prev,
            sort: selected.value,
          }))
        }
        isSearchable={false}
        className="  text-sm"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "0.75rem",
            minHeight: "40px",
          }),
        }}
      />

      <Select
        options={statusOptions}
        value={currentStatus}
        onChange={(selected) =>
          setFilterState((prev) => ({
            ...prev,
            status: selected.value,
          }))
        }
        isSearchable={false}
        // classNames="min-w-[140px] text-sm "
        classNames={{
          control: ({ isFocused }) =>
            `border  ${
              isFocused
                ? "border-indigo-500 ring-2 ring-indigo-200"
                : "border-zinc-300"
            }`,
        }}
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "0.75rem",
            minHeight: "40px",
          }),
        }}
      />
    </div>
  );
}

const defaultForm = {
  category_id: "",
  sub_category_id: "",
  brand_id: "",
  name: "",
  short_description: "",
  long_description: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  sku: "",
  price: "",
  tax_percentage: "",
  weight: "",
  width: "",
  height: "",
  depth: "",
  warranty_months: "",
  available_stock: "",
  is_universal: false,
  is_available: true,
  is_featured: false,
  is_front: false,
  status: "active",
};

export default function ProductsAdminPage() {
  const fetchList = useCallback(async (page, filters) => {
    const res = await getAllProductsApi({
      page,
      limit: 10,
      status: filters.status || "all",
      search: filters.search || "",
      sort_by: filters.sort || "latest",
    });
    return res;
  }, []);

  // FIX: createItem now properly handles all cases
  const createItemHandler = useCallback(async (data) => {
    let payload = data;
    if (data instanceof FormData) {
      payload = data;
    } else {
      // Handle non-FormData case - create FormData if there are files
      // or just pass the object directly
      payload = data;
    }
    const result = await createProductApi(payload);
    return result.data;
  }, []);

  const updateItemHandler = useCallback(async (id, data) => {
    const result = await updateProductApi(id, data);
    return result.data;
  }, []);

  const deleteItemHandler = useCallback(async (id) => {
    const result = await deleteProductApi(id);
    return result;
  }, []);

  const toggleStatusHandler = useCallback(async (id) => {
    const result = await toggleProductStatusApi(id);
    return result.data;
  }, []);

  const pendingRemovalRef = useRef([]);
  const pendingImageDeletionsRef = useRef([]);

  const updateItemHandlerWithRemovals = useCallback(async (id, data) => {
    const removals = pendingRemovalRef.current;
    pendingRemovalRef.current = [];
    for (const removalId of removals) {
      await removeCompatibility(removalId);
    }
    const imageDeletions = pendingImageDeletionsRef.current;
    pendingImageDeletionsRef.current = [];
    for (const imageId of imageDeletions) {
      await deleteProductImageApi(imageId);
    }
    const result = await updateProductApi(id, data);
    return result.data;
  }, []);

  return (
    <CrudPage
      title="Products"
      description="Manage catalog products — vehicle parts and accessories"
      idKey="id"
      modalWide
      defaultForm={defaultForm}
      fileFields={["product_media"]}
      fetchList={fetchList}
      createItem={createItemHandler}
      updateItem={updateItemHandlerWithRemovals}
      deleteItem={deleteItemHandler}
      toggleStatus={toggleStatusHandler}
      restoreItem={restoreProductApi}
      FilterComponent={ProductFilters}
      onModalClose={() => {
        pendingRemovalRef.current = [];
        pendingImageDeletionsRef.current = [];
      }}
      columns={[
        { key: "no", label: "#" },
        {
          key: "name",
          label: "Product",
          render: (row) => (
            <div className="flex items-center sm:flex-row w-48 flex-col sm:justify-start gap-10 justify-end gap-3">
              <ImageCell src={row.media?.[0]?.image_url} />
              <span className="font-medium text-slate-800">{row.name}</span>
            </div>
          ),
        },
        {
          key: "sku",
          label: "SKU",
          render: (row) => (
            <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">
              {row.sku}
            </code>
          ),
        },
        {
          key: "price",
          label: "Price",
          render: (row) => (
            <span className="text-slate-700">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(row.price)}
            </span>
          ),
        },
        {
          key: "available_stock",
          label: "Stock",
          render: (row) => (
            <span
              className={`font-medium ${
                row.available_stock <= 5
                  ? "text-rose-600"
                  : row.available_stock <= 20
                    ? "text-amber-600"
                    : "text-emerald-600"
              }`}
            >
              {row.available_stock}
            </span>
          ),
        },
        {
          key: "is_featured",
          label: "Featured",
          render: (row) => <span>{row.is_featured ? "Yes" : "No"}</span>,
        },
        {
          key: "status",
          label: "Status",
        },
      ]}
      formFields={[
        {
          name: "name",
          label: "Product Name",
          required: true,
          colSpan: 2,
        },

        {
          name: "is_universal",
          label: "Universal Compatibility (fits all vehicles)",
          type: "checkbox",
          colSpan: 2,
        },

        {
          name: "vehicle_generation_ids",
          label: "Vehicle Compatibility",
          type: "vehicle-selector",
          colSpan: 2,
          dependsOnUniversal: "is_universal",
          loadMakeOptions: () => fetchMakeOptions(),
          loadModelOptions: (makeId) => fetchModelOptionsByMake(makeId),
          loadGenerationOptions: (modelId) =>
            fetchGenerationOptionsByModel(modelId),
          loadCompatibilities: (productId) =>
            getCompatibilityByProduct(productId),
          onPendingRemoval: (id) => pendingRemovalRef.current.push(id),
          onCreateMake: async (payload) => {
            const fd = new FormData();
            fd.append("name", payload.name);
            if (payload.image) fd.append("logo_url", payload.image);
            return createMake(fd);
          },
          onCreateModel: async (makeId, payload) => {
            const fd = new FormData();
            fd.append("make_id", makeId);
            fd.append("name", payload.name);
            if (payload.description)
              fd.append("description", payload.description);
            if (payload.image) fd.append("model_image_url", payload.image);
            return createModel(fd);
          },
          onCreateGeneration: async (modelId, payload) =>
            createGeneration({
              model_id: modelId,
              generation_name: payload.generation_name,
              year_from: payload.year_from,
              year_to: payload.year_to,
            }),
        },

        {
          name: "category_id",
          label: "Category",
          type: "select",
          required: true,
          loadOptions: () => fetchCategoryOptions(),
          onCreate: async (payload) => {
            const fd = new FormData();
            fd.append("name", payload.name);
            if (payload.description)
              fd.append("description", payload.description);
            if (payload.image) fd.append("image_url", payload.image);
            return createCategory(fd);
          },
        },

        {
          name: "sub_category_id",
          label: "Sub Category",
          type: "select",
          required: true,
          dependsOn: "category_id",
          loadOptions: (categoryId) => fetchSubcategoryOptions(categoryId),
          onCreate: async (payload, form) => {
            const fd = new FormData();
            fd.append("name", payload.name);
            if (payload.description)
              fd.append("description", payload.description);
            if (payload.image) fd.append("image_url", payload.image);
            fd.append("category_id", form.category_id);
            return createSubcategory(fd);
          },
        },

        {
          name: "brand_id",
          label: "Brand",
          type: "select",
          required: true,
          loadOptions: () => fetchBrandOptions(),
          onCreate: async (payload) => {
            const fd = new FormData();
            fd.append("name", payload.name);
            if (payload.image) fd.append("logo_url", payload.image);
            return createBrand(fd);
          },
        },

        {
          name: "product_media",
          label: "Product Images",
          type: "file",
          multiple: true,
          accept: "image/*",
          colSpan: 2,
          loadImages: (productId) => getProductImagesApi(productId),
          onPendingImageDelete: (imageId) =>
            pendingImageDeletionsRef.current.push(imageId),
          onReorderImages: (productId, reorderData) =>
            reorderProductImagesApi(productId, reorderData),
        },

        {
          name: "sku",
          label: "SKU",
          required: true,
          placeholder: "Unique product code",
        },

        {
          name: "price",
          label: "Price (INR)",
          type: "number",
          required: true,
          min: 0,
          step: 0.01,
        },
        {
          name: "tax_percentage",
          label: "Tax Percentage (%)",
          type: "number",
          min: 0,
          step: 0.01,
        },

        {
          name: "available_stock",
          label: "Available Stock",
          type: "number",
          min: 0,
        },

        {
          name: "weight",
          label: "Weight (kg)",
          type: "number",
          min: 0,
          step: 0.01,
        },

        {
          name: "width",
          label: "Width (cm)",
          type: "number",
          min: 0,
          step: 0.1,
        },

        {
          name: "height",
          label: "Height (cm)",
          type: "number",
          min: 0,
          step: 0.1,
        },

        {
          name: "depth",
          label: "Depth (cm)",
          type: "number",
          min: 0,
          step: 0.1,
        },

        {
          name: "warranty_months",
          label: "Warranty (Months)",
          type: "number",
          min: 0,
          step: 1,
          placeholder: "Warranty period in months",
        },

        {
          name: "short_description",
          label: "Details",
          type: "textarea",
          colSpan: 2,
          rows: 2,
          placeholder: "Brief product summary",
        },

        {
          name: "long_description",
          label: "Features",
          type: "textarea",
          rows: 5,
          colSpan: 2,
          placeholder: "Detailed product information",
        },

        {
          name: "seo_description",
          label: "Specifications",
          type: "textarea",
          colSpan: 2,
          rows: 2,
          placeholder: "Meta description for search engines",
        },

        {
          name: "seo_title",
          label: "SEO Title",
          colSpan: 2,
          placeholder: "Page title for search engines",
        },

        {
          name: "seo_keywords",
          label: "SEO Keywords",
          colSpan: 2,
          placeholder: "Comma-separated keywords",
        },

        {
          name: "status_toggles",
          type: "checkbox-group",
          colSpan: 2,
          checkboxes: [
            { name: "is_available", label: "Available for Purchase" },
            { name: "is_featured", label: "Featured Product" },
            { name: "is_front", label: "Show on Homepage" },
          ],
        },

        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { id: "active", name: "Active" },
            { id: "inactive", name: "Inactive" },
          ],
        },
      ]}
      preparePayload={(form, editingRow) => ({
        ...form,

        // Convert IDs to numbers
        category_id: Number(form.category_id) || null,
        sub_category_id: Number(form.sub_category_id) || null,
        brand_id: Number(form.brand_id) || null,

        // Convert numbers
        price: Number(form.price) || 0,
        tax_percentage: Number(form.tax_percentage) || 0.0,
        weight: Number(form.weight) || 0,
        width: Number(form.width) || 0,
        height: Number(form.height) || 0,
        depth: Number(form.depth) || 0,
        available_stock: Number(form.available_stock) || 0,

        // Convert booleans to numbers (backend may expect 0/1)
        is_universal: form.is_universal ? 1 : 0,
        is_available: form.is_available ? 1 : 0,
        is_featured: form.is_featured ? 1 : 0,
        is_front: form.is_front ? 1 : 0,

        // Handle vehicle compatibility IDs
        vehicle_generation_ids: form.is_universal
          ? []
          : form.vehicle_generation_ids || [],
      })}
    />
  );
}
