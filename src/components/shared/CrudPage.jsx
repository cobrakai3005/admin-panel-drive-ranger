import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import {
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import PageHeader from "./PageHeader";
import Pagination from "./Pagination";
import Modal from "./Modal";
import FormSelect from "./SelectField";
import MultiSelectField from "./MultiSelect";
import StatusBadge from "./StatusBadge";
import { toast } from "sonner";
import Select from "react-select";
import { confirmDelete, confirmUpdate, confirmToggle } from "./Confirm";

// Helper to build FormData from values
function buildFormData(values, fileFields = []) {
  const fd = new FormData();

  Object.entries(values).forEach(([key, val]) => {
    if (fileFields.includes(key)) {
      let files = [];

      if (val instanceof FileList) {
        files = Array.from(val);
      } else if (Array.isArray(val)) {
        files = val;
      } else if (val instanceof File) {
        files = [val];
      }

      files.forEach((file) => {
        if (file instanceof File) fd.append(key, file);
      });

      return;
    }

    if (Array.isArray(val)) {
      val.forEach((item) => {
        fd.append(`${key}[]`, item);
      });
      return;
    }

    if (val !== undefined && val !== null && val !== "") {
      fd.append(key, val);
    }
  });

  return fd;
}

// Field renderer component - hooks are always called in the same order
function FieldRenderer({ field, form, setForm, editingRow, idKey }) {
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [compatibilities, setCompatibilities] = useState([]);
  const [loadingCompatibilities, setLoadingCompatibilities] = useState(false);
  const [selectedPreviews, setSelectedPreviews] = useState([]);
  const fileInputRef = useRef(null);
  const firstFilterRender = useRef(true);
  // Cleanup blob URLs when component unmounts or previews change
  const prevPreviewsRef = useRef(selectedPreviews);

  useEffect(() => {
    // Revoke URLs from previous previews that are no longer in the current set
    const removedPreviews = prevPreviewsRef.current.filter(
      (p) => !selectedPreviews.find((sp) => sp.preview === p.preview),
    );
    removedPreviews.forEach((p) => URL.revokeObjectURL(p.preview));

    prevPreviewsRef.current = selectedPreviews;
  }, [selectedPreviews]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      selectedPreviews.forEach((p) => URL.revokeObjectURL(p.preview));
    };
  }, []);

  // Load existing images when editing
  useEffect(() => {
    if (!editingRow) {
      setExistingImages([]);
      return;
    }

    // Single image already present in the row
    if (!field.loadImages) {
      const imageUrl = editingRow[field.imageField || field.name];
      if (imageUrl) {
        setExistingImages([
          {
            id: editingRow[idKey],
            image_url: imageUrl,
          },
        ]);
      } else {
        setExistingImages([]);
      }
      return;
    }

    // Multiple images loaded from API
    const recordId = editingRow[idKey];
    if (!recordId) {
      setExistingImages([]);
      return;
    }

    setLoadingImages(true);
    field
      .loadImages(recordId)
      .then((res) => setExistingImages(res?.data || []))
      .catch((err) => {
        console.error("Failed to load images:", err);
        setExistingImages([]);
      })
      .finally(() => setLoadingImages(false));
  }, [editingRow, field, idKey]);

  // Load compatibilities when editing
  useEffect(() => {
    // FIX: Check the correct property name
    if (!editingRow || !field.loadCompatibilities) {
      setCompatibilities([]);
      return;
    }

    const recordId = editingRow[idKey];
    if (!recordId) {
      setCompatibilities([]);
      return;
    }

    setLoadingCompatibilities(true);
    field
      .loadCompatibilities(recordId)
      .then((data) => {
        console.log(data);

        setCompatibilities(data?.data || data || []);
        // Pre-populate the form with existing vehicle_generation_ids
        if (data && data.length > 0 && field.type === "multi-select") {
          const existingIds = data.map((item) => item.vehicle_generation_id);
          setForm((prev) => ({ ...prev, [field.name]: existingIds }));
        }
      })
      .catch((err) => {
        console.error("Failed to load compatibilities:", err);
        setCompatibilities([]);
      })
      .finally(() => setLoadingCompatibilities(false));
  }, [editingRow, field.loadCompatibilities, field.type, field.name, idKey]);

  // Common value getter
  const value = useMemo(() => {
    if (field.type === "date") {
      const val = form[field.name];
      return val ? new Date(val).toISOString().split("T")[0] : "";
    }
    if (field.type === "multi-select" || field.type === "vehicle-selector") {
      return form[field.name] ?? [];
    }
    if (field.type === "number") {
      return form[field.name] ?? "";
    }
    return form[field.name] ?? "";
  }, [form, field.name, field.type]);

  const onChange = (v) => {
    let val = v;
    if (field.type === "number") {
      val = v === 0 ? "" : v;
    }
    setForm((prev) => ({ ...prev, [field.name]: val }));
  };

  // File change handler
  const handleFileChange = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      const previews = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));

      setSelectedPreviews((prev) => {
        prev.forEach((p) => URL.revokeObjectURL(p.preview));
        return previews;
      });
      onChange(files);
    },
    [onChange],
  );

  // Remove existing image
  const handleRemoveImage = useCallback(
    async (imageId) => {
      if (field.deleteImage) {
        try {
          await field.deleteImage(imageId);
          setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
          toast.success("Image removed");
        } catch (err) {
          console.error("Failed to remove image:", err);
          toast.error("Failed to remove image");
        }
        return;
      }

      // Single image removal (for Category, Brand, etc.)
      setExistingImages([]);
      onChange(null);
    },
    [field.deleteImage, onChange],
  );

  // Remove selected preview (FIX: don't try to modify file input programmatically)
  // const handleRemoveSelected = useCallback(
  //   (index) => {
  //     setSelectedPreviews((prev) => {
  //       const updated = [...prev];
  //       URL.revokeObjectURL(updated[index].preview);
  //       updated.splice(index, 1);
  //       return updated;
  //     });

  //     onChange(
  //       selectedPreviews.filter((_, i) => i !== index).map((p) => p.file),
  //     );
  //   },
  //   [selectedPreviews, onChange],
  // );

  const handleRemoveSelected = useCallback(
    (index) => {
      setSelectedPreviews((prev) => {
        const updated = [...prev];

        URL.revokeObjectURL(updated[index].preview);
        updated.splice(index, 1);

        // Create a new FileList
        const dataTransfer = new DataTransfer();

        updated.forEach((item) => {
          dataTransfer.items.add(item.file);
        });

        fileInputRef.current.files = dataTransfer.files;

        onChange(Array.from(dataTransfer.files));

        return updated;
      });
    },
    [onChange],
  );

  // Remove compatibility
  const handleRemoveCompatibility = useCallback(
    async (compatibilityId) => {
      if (!field.removeCompatibility) return;

      try {
        await field.removeCompatibility(compatibilityId);
        setCompatibilities((prev) =>
          prev.filter((comp) => comp.id !== compatibilityId),
        );
        toast.success("Vehicle compatibility removed");
      } catch (err) {
        console.error("Failed to remove compatibility:", err);
        toast.error("Failed to remove vehicle compatibility");
      }
    },
    [field.removeCompatibility],
  );

  // ----- SELECT -----
  if (field.type === "select") {
    if (field.onCreate) {
      return (
        <CreatableSelectField
          field={field}
          value={value}
          form={form}
          onChange={onChange}
        />
      );
    }
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {field.label}
          {field.required && " *"}
        </label>
        <FormSelect
          field={field}
          value={value}
          form={form}
          onChange={onChange}
        />
      </div>
    );
  }

  // ----- MULTI-SELECT -----
  if (field.type === "multi-select") {
    return (
      <div
        className={field.colSpan === 2 ? "col-span-2 space-y-3" : "space-y-3"}
      >
        <MultiSelectField
          field={field}
          value={value}
          onChange={onChange}
          editingRow={editingRow}
        />

        {/* Display existing compatibilities when editing */}
        {editingRow && compatibilities.length > 0 && (
          <div className="space-y-2 mt-3">
            <p className="text-xs font-medium text-slate-600">
              Current Vehicle Compatibility:
            </p>
            <div className="flex flex-wrap gap-2">
              {compatibilities.map((comp) => (
                <div
                  key={comp.id}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <span className="font-medium text-slate-800">
                    {comp.make_name}
                  </span>
                  <span className="text-slate-400">{comp.model_name}</span>
                  <span className="px-2 py-0.5 bg-primary-light text-primary rounded-full font-medium">
                    {comp.generation_name}
                  </span>
                  <span className="text-slate-500">
                    {comp.year_from} - {comp.year_to || "Present"}
                  </span>
                  {field.removeCompatibility && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCompatibility(comp.id)}
                      className="ml-1 p-0.5 rounded hover:bg-red-100 text-red-500"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {loadingCompatibilities && (
          <p className="text-xs text-slate-400">
            Loading vehicle compatibility...
          </p>
        )}
      </div>
    );
  }

  // ----- VEHICLE SELECTOR (cascading make → model → generations) -----
  if (field.type === "vehicle-selector") {
    return (
      <VehicleSelectorField
        field={field}
        value={value}
        onChange={onChange}
        form={form}
        setForm={setForm}
        editingRow={editingRow}
      />
    );
  }

  // ----- TEXTAREA -----
  if (field.type === "textarea") {
    return (
      <div
        className={
          field.colSpan === 2 ? "col-span-2 space-y-1.5" : "space-y-1.5"
        }
      >
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {field.label}
          {field.required && " *"}
        </label>
        <textarea
          rows={field.rows || 3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
          placeholder={field.placeholder}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    );
  }

  // ----- FILE -----
  if (field.type === "file") {
    return (
      <div
        className={field.colSpan === 2 ? "col-span-2 space-y-3" : "space-y-3"}
      >
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {field.label}
        </label>

        {/* //  Existing images */}
        {editingRow && field.multiple === true && existingImages.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {existingImages.map((img) => (
              <div key={img.id} className="relative group">
                <img
                  src={img.image_url}
                  alt="Existing"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
                {(field.deleteImage || !field.loadImages) && (
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(img.id)}
                    className="absolute -top-2 -right-2 bg-rose-100 text-rose-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-200"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {loadingImages && (
          <p className="text-xs text-slate-400">Loading images...</p>
        )}

        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple={field.multiple}
          accept={field.accept || "image/*"}
          onChange={handleFileChange}
          className="w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-light file:text-primary file:font-medium hover:file:bg-primary-light cursor-pointer"
        />

        {/* Selected previews */}
        {selectedPreviews.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {selectedPreviews.map((img, index) => (
              <div
                key={`${img.preview}-${index}`}
                className="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
              >
                <img
                  src={img.preview}
                  alt={img.file.name}
                  className="h-24 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSelected(index)}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 text-xs"
                >
                  <X size={12} />
                </button>
                <div className="p-2">
                  <p className="truncate text-xs text-slate-600">
                    {img.file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ----- CHECKBOX -----
  if (field.type === "checkbox") {
    return (
      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
        />
        {field.label}
      </label>
    );
  }

  // ----- DEFAULT (text, number, date, etc.) -----
  return (
    // <div
    //   className={field.colSpan === 2 ? "col-span-2 space-y-1.5" : "space-y-1.5"}
    // >
    //   <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
    //     {field.label}
    //     {field.required && " *"}
    //   </label>
    //   <input
    //     type={field.type || "text"}
    //     value={value}
    //     onChange={(e) =>
    //       onChange(
    //         field.type === "number"
    //           ? Number(e.target.value) || 0
    //           : e.target.value,
    //       )
    //     }
    //     required={field.required}
    //     min={field.min}
    //     max={field.max}
    //     step={field.step}
    //     placeholder={field.placeholder}
    //     className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
    //   />
    // </div>
    <div className={field.colSpan === 2 ? "col-span-2 space-y-2" : "space-y-2"}>
      <label className="block text-[11px] font-black uppercase tracking-widest text-slate-700 ml-1">
        {field.label}
        {field.required && <span className="text-primary ml-0.5">*</span>}
      </label>

      <div className="relative group">
        <input
          type={field.type || "text"}
          value={value}
          onChange={(e) =>
            onChange(
              field.type === "number"
                ? Number(e.target.value) || 0
                : e.target.value,
            )
          }
          required={field.required}
          min={field.min}
          max={field.max}
          step={field.step}
          placeholder={field.placeholder}
          className="
        w-full px-4 py-3 rounded-xl 
        bg-white border-2 border-slate-200 
        text-sm font-medium text-slate-900
        placeholder:text-slate-400
        transition-all duration-200
        shadow-sm
        hover:border-slate-300
        focus:outline-none 
        focus:ring-4 focus:ring-primary/10 
        focus:border-primary
        active:scale-[0.99]
      "
        />
      </div>
    </div>
  );
}

// Creatable select — adds "+" button + inline form for on-the-fly creation
function CreatableSelectField({ field, value, form, onChange }) {
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createImage, setCreateImage] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [selectKey, setSelectKey] = useState(0);

  const resetForm = () => {
    setCreateName("");
    setCreateDesc("");
    setCreateImage(null);
  };

  const handleCreate = async () => {
    if (!field.onCreate || !createName.trim()) return;
    setCreateLoading(true);
    try {
      const payload = { name: createName.trim() };
      if (createDesc.trim()) payload.description = createDesc.trim();
      if (createImage) payload.image = createImage;
      const res = await field.onCreate(payload, form);
      const newItem = res?.data || res;
      onChange(newItem.id);
      resetForm();
      setCreating(false);
      setSelectKey((k) => k + 1);
      toast.success(`${field.label} created`);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || `Failed to create ${field.label}`,
      );
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
          {field.label}
          {field.required && " *"}
        </label>
        {(!field.dependsOn || form[field.dependsOn]) && (
          <button
            type="button"
            onClick={() => setCreating(!creating)}
            className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
          >
            <Plus size={12} />
          </button>
        )}
      </div>
      <FormSelect
        key={selectKey}
        field={field}
        value={value}
        form={form}
        onChange={onChange}
      />
        {creating && (
          <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <p className="text-xs font-semibold text-slate-600">
              New {field.label}
            </p>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <textarea
              value={createDesc}
              onChange={(e) => setCreateDesc(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCreateImage(e.target.files?.[0] || null)}
                className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-primary file:font-medium file:text-xs hover:file:bg-slate-50 cursor-pointer"
              />
              {createImage && (
                <img
                  src={URL.createObjectURL(createImage)}
                  alt="preview"
                  className="mt-2 h-16 w-16 object-cover rounded-lg border border-slate-200"
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCreate}
                disabled={createLoading || !createName.trim()}
                className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 hover:bg-primary/90"
              >
                {createLoading ? "Creating..." : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setCreating(false);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vehicle selector component – cascading make → model → generations with accumulation
function VehicleSelectorField({
  field,
  value,
  onChange,
  form,
  setForm,
  editingRow,
}) {
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [genOptions, setGenOptions] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingGens, setLoadingGens] = useState(false);
  const [selectedGenIds, setSelectedGenIds] = useState([]);
  const [accumulated, setAccumulated] = useState([]);
  const [loadingCompatibilities, setLoadingCompatibilities] = useState(false);

  // Inline creation state
  const [creating, setCreating] = useState(null);
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createImage, setCreateImage] = useState(null);
  const [createYearFrom, setCreateYearFrom] = useState("");
  const [createYearTo, setCreateYearTo] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const selectedMakeId = form.vehicle_make_id;
  const selectedModelId = form.vehicle_model_id;

  useEffect(() => {
    if (!field.loadMakeOptions) return;
    setLoadingMakes(true);
    field
      .loadMakeOptions()
      .then((data) => setMakes(data || []))
      .catch((err) => console.error("Failed to load makes:", err))
      .finally(() => setLoadingMakes(false));
  }, [field.loadMakeOptions]);

  useEffect(() => {
    if (!selectedMakeId) {
      setModels([]);
      return;
    }
    setLoadingModels(true);
    field
      .loadModelOptions(selectedMakeId)
      .then((data) => setModels(data || []))
      .catch((err) => console.error("Failed to load models:", err))
      .finally(() => setLoadingModels(false));
  }, [selectedMakeId, field.loadModelOptions]);

  useEffect(() => {
    if (!selectedModelId) {
      setGenOptions([]);
      return;
    }
    setLoadingGens(true);
    field
      .loadGenerationOptions(selectedModelId)
      .then((data) => setGenOptions(data || []))
      .catch((err) => console.error("Failed to load generations:", err))
      .finally(() => setLoadingGens(false));
  }, [selectedModelId, field.loadGenerationOptions]);

  useEffect(() => {
    if (!editingRow || !field.loadCompatibilities) return;
    setLoadingCompatibilities(true);
    field
      .loadCompatibilities(editingRow.id)
      .then((data) => {
        const items = data?.data || data || [];
        setAccumulated(
          items.map((item) => ({
            id: item.id,
            vehicle_generation_id: item.vehicle_generation_id,
            make_name: item.make_name || "",
            model_name: item.model_name || "",
            generation_name: item.generation_name || "",
            year_from: item.year_from,
            year_to: item.year_to,
            isExisting: true,
          })),
        );
        onChange(items.map((item) => item.vehicle_generation_id));
      })
      .catch((err) => console.error("Failed to load compatibilities:", err))
      .finally(() => setLoadingCompatibilities(false));
  }, [editingRow]);

  useEffect(() => {
    if (!editingRow) setAccumulated([]);
  }, [editingRow]);

  const handleMakeChange = (opt) => {
    const newMakeId = opt?.value || "";
    setForm((prev) => ({
      ...prev,
      vehicle_make_id: newMakeId,
      vehicle_model_id: "",
    }));
    setSelectedGenIds([]);
    setGenOptions([]);
  };

  const handleModelChange = (opt) => {
    const newModelId = opt?.value || "";
    setForm((prev) => ({ ...prev, vehicle_model_id: newModelId }));
    setSelectedGenIds([]);
  };

  const handleAddGenerations = () => {
    if (!selectedGenIds.length) return;
    const existingIds = new Set(
      accumulated.map((item) => item.vehicle_generation_id),
    );
    const newItems = genOptions
      .filter((g) => selectedGenIds.includes(g.id) && !existingIds.has(g.id))
      .map((g) => ({
        id: null,
        vehicle_generation_id: g.id,
        make_name: g.make_name || "",
        model_name: g.model_name || "",
        generation_name: g.generation_name || "",
        year_from: g.year_from,
        year_to: g.year_to,
        isExisting: false,
      }));
    if (!newItems.length) return;
    const updated = [...accumulated, ...newItems];
    setAccumulated(updated);
    onChange(updated.map((item) => item.vehicle_generation_id));
    setSelectedGenIds([]);
  };

  const handleRemoveItem = (item) => {
    if (item.isExisting && field.removeCompatibility && item.id) {
      field.removeCompatibility(item.id).catch((err) => {
        console.error("Failed to remove compatibility:", err);
        toast.error("Failed to remove compatibility");
      });
    }
    const updated = accumulated.filter(
      (i) => i.vehicle_generation_id !== item.vehicle_generation_id,
    );
    setAccumulated(updated);
    onChange(updated.map((item) => item.vehicle_generation_id));
  };

  // Inline creation handlers
  const resetCreateForm = () => {
    setCreating(null);
    setCreateName("");
    setCreateDesc("");
    setCreateImage(null);
    setCreateYearFrom("");
    setCreateYearTo("");
  };

  const handleCreateMake = async () => {
    if (!field.onCreateMake || !createName.trim()) return;
    setCreateLoading(true);
    try {
      const payload = { name: createName.trim() };
      if (createDesc.trim()) payload.description = createDesc.trim();
      if (createImage) payload.image = createImage;
      const res = await field.onCreateMake(payload);
      const newMake = res?.data || res;
      // Refresh makes and select the new one
      const data = await field.loadMakeOptions();
      setMakes(data || []);
      setForm((prev) => ({
        ...prev,
        vehicle_make_id: newMake.id,
        vehicle_model_id: "",
      }));
      setSelectedGenIds([]);
      setGenOptions([]);
      resetCreateForm();
      toast.success("Make created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create make");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateModel = async () => {
    if (!field.onCreateModel || !createName.trim() || !selectedMakeId) return;
    setCreateLoading(true);
    try {
      const payload = { name: createName.trim() };
      if (createDesc.trim()) payload.description = createDesc.trim();
      if (createImage) payload.image = createImage;
      const res = await field.onCreateModel(selectedMakeId, payload);
      const newModel = res?.data || res;
      const data = await field.loadModelOptions(selectedMakeId);
      setModels(data || []);
      setForm((prev) => ({ ...prev, vehicle_model_id: newModel.id }));
      setSelectedGenIds([]);
      resetCreateForm();
      toast.success("Model created");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create model");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateGeneration = async () => {
    if (!field.onCreateGeneration || !selectedModelId) return;
    setCreateLoading(true);
    try {
      const payload = {
        generation_name: createName.trim() || null,
        year_from: createYearFrom,
        year_to: createYearTo || null,
      };
      if (createDesc.trim()) payload.description = createDesc.trim();
      if (createImage) payload.image = createImage;
      const res = await field.onCreateGeneration(selectedModelId, payload);
      const newGen = res?.data || res;
      const data = await field.loadGenerationOptions(selectedModelId);
      setGenOptions(data || []);
      setSelectedGenIds((prev) => [...prev, newGen.id]);
      resetCreateForm();
      toast.success("Generation created");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create generation",
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const toggleCreate = (type) => {
    if (creating === type) {
      resetCreateForm();
    } else {
      setCreateDesc("");
      setCreateImage(null);
      setCreateName("");
      setCreateYearFrom("");
      setCreateYearTo("");
      setCreating(type);
    }
  };

  const makeOptions = makes.map((m) => ({ value: m.id, label: m.name }));
  const modelOptions = models.map((m) => ({ value: m.id, label: m.name }));
  const genSelectOptions = genOptions.map((g) => ({
    value: g.id,
    label: `${g.year_from} - ${g.year_to || "Present"}`,
  }));

  const selectedGenReact = genSelectOptions.filter((o) =>
    selectedGenIds.includes(o.value),
  );

  const isUniversal = form[field.dependsOnUniversal];

  if (isUniversal) {
    return (
      <div className={field.colSpan === 2 ? "col-span-2" : ""}>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-500">
          Universal compatibility — fits all vehicles
        </div>
      </div>
    );
  }

  return (
    <div className={field.colSpan === 2 ? "col-span-2 space-y-3" : "space-y-3"}>
      <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {field.label}
      </label>

      <div className="flex gap-3 items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <label className="block text-xs text-slate-500">Make</label>
            {field.onCreateMake && (
              <button
                type="button"
                onClick={() => toggleCreate("make")}
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
          <Select
            options={makeOptions}
            value={makeOptions.find((o) => o.value === selectedMakeId) || null}
            onChange={handleMakeChange}
            isLoading={loadingMakes}
            placeholder="Select Make..."
          />
          {creating === "make" && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-600">New Make</p>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateImage(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-primary file:font-medium file:text-xs hover:file:bg-slate-50 cursor-pointer"
                />
                {createImage && (
                  <img
                    src={URL.createObjectURL(createImage)}
                    alt="preview"
                    className="mt-2 h-16 w-16 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateMake}
                  disabled={createLoading || !createName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 hover:bg-primary/90"
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetCreateForm}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <label className="block text-xs text-slate-500">Model</label>
            {field.onCreateModel && selectedMakeId && (
              <button
                type="button"
                onClick={() =>
                  toggleCreate("model")
                }
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
          <Select
            options={modelOptions}
            value={
              modelOptions.find((o) => o.value === selectedModelId) || null
            }
            onChange={handleModelChange}
            isLoading={loadingModels}
            isDisabled={!selectedMakeId}
            placeholder={
              selectedMakeId ? "Select Model..." : "Select a make first"
            }
          />
          {creating === "model" && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-600">New Model</p>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateImage(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-primary file:font-medium file:text-xs hover:file:bg-slate-50 cursor-pointer"
                />
                {createImage && (
                  <img
                    src={URL.createObjectURL(createImage)}
                    alt="preview"
                    className="mt-2 h-16 w-16 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateModel}
                  disabled={createLoading || !createName.trim()}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 hover:bg-primary/90"
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetCreateForm}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-[2] min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <label className="block text-xs text-slate-500">Generations</label>
            {field.onCreateGeneration && selectedModelId && (
              <button
                type="button"
                onClick={() =>
                  toggleCreate("generation")
                }
                className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600"
              >
                <Plus size={12} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                options={genSelectOptions}
                value={selectedGenReact}
                onChange={(opts) =>
                  setSelectedGenIds(opts ? opts.map((o) => o.value) : [])
                }
                isLoading={loadingGens}
                isMulti
                isDisabled={!selectedModelId}
                placeholder={
                  selectedModelId
                    ? "Select Generations..."
                    : "Select a model first"
                }
              />
            </div>
            <button
              type="button"
              onClick={handleAddGenerations}
              disabled={!selectedGenIds.length}
              className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 shrink-0"
            >
              Add
            </button>
          </div>
          {creating === "generation" && (
            <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-600">New Generation</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Name (optional)"
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="number"
                  value={createYearFrom}
                  onChange={(e) => setCreateYearFrom(e.target.value)}
                  placeholder="Year from"
                  className="w-24 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <input
                  type="number"
                  value={createYearTo}
                  onChange={(e) => setCreateYearTo(e.target.value)}
                  placeholder="Year to"
                  className="w-24 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <textarea
                value={createDesc}
                onChange={(e) => setCreateDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
              />
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                  Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCreateImage(e.target.files?.[0] || null)}
                  className="w-full text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white file:text-primary file:font-medium file:text-xs hover:file:bg-slate-50 cursor-pointer"
                />
                {createImage && (
                  <img
                    src={URL.createObjectURL(createImage)}
                    alt="preview"
                    className="mt-2 h-16 w-16 object-cover rounded-lg border border-slate-200"
                  />
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCreateGeneration}
                  disabled={createLoading || !createYearFrom}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-50 hover:bg-primary/90"
                >
                  {createLoading ? "Creating..." : "Create"}
                </button>
                <button
                  type="button"
                  onClick={resetCreateForm}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {accumulated.length > 0 && (
        <div className="space-y-2 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-600">
            Selected Generations:
          </p>
          <div className="flex flex-wrap gap-2">
            {accumulated.map((item) => (
              <div
                key={item.vehicle_generation_id}
                className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs"
              >
                <span className="font-medium text-slate-800">
                  {item.make_name}
                </span>
                <span className="text-slate-400">{item.model_name}</span>
                <span className="px-2 py-0.5 bg-primary-light text-primary rounded-full font-medium">
                  {item.generation_name}
                </span>
                <span className="text-slate-500">
                  {item.year_from} - {item.year_to || "Present"}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item)}
                  className="ml-1 p-0.5 rounded hover:bg-red-100 text-red-500"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {loadingCompatibilities && (
        <p className="text-xs text-slate-400">
          Loading vehicle compatibility...
        </p>
      )}
    </div>
  );
}

// Main CrudPage component
export default function CrudPage({
  title,
  description,
  idKey = "id",
  columns,
  formFields = [],
  defaultForm = {},
  fileFields = [],
  fetchList,
  getDefaultForm,
  createItem,
  updateItem,
  deleteItem,
  toggleStatus,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  createLabel = "Add New",
  modalWide = false,
  FilterComponent,
  emptyMessage = "No records found.",
  preparePayload,
  onEditRow,
  onFilterChange,
  initialFilterState = {},
}) {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [filterState, setFilterState] = useState(initialFilterState);
  const [currentPage, setCurrentPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const firstFilterRender = useRef(true);

  // Load data
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchList(page, filterState);

      setRows(res?.data || []);
      setTotalPages(res?.pagination?.totalPages || 1);
      setCurrentPage(res?.pagination?.page || 0);
      setLimit(res?.pagination?.limit || 10);
    } catch (err) {
      console.error("Failed to load data:");
      toast.error(err.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [fetchList, page, filterState]);

  useEffect(() => {
    load();
  }, [load]);

  // FIX: Reset to page 1 when filters change
  const handleFilterChange = useCallback(
    (newFilterState) => {
      setFilterState(newFilterState);
      if (onFilterChange) {
        onFilterChange(newFilterState);
      }
    },
    [onFilterChange],
  );

  useEffect(() => {
    if (firstFilterRender.current) {
      firstFilterRender.current = false;
      return;
    }

    setPage((prev) => (prev === 1 ? prev : 1));
  }, [filterState]);

  const openCreate = useCallback(() => {
    setEditingRow(null);
    const initial = getDefaultForm ? getDefaultForm() : { ...defaultForm };
    setForm(initial);
    setModalOpen(true);
  }, [defaultForm, getDefaultForm]);

  const openEdit = useCallback(
    (row) => {
      if (onEditRow) {
        onEditRow(row);
        return;
      }

      setEditingRow(row);
      const next = { ...defaultForm };
      formFields.forEach((f) => {
        if (row[f.name] !== undefined && row[f.name] !== null) {
          next[f.name] = row[f.name];
        }
      });
      setForm(next);
      setModalOpen(true);
    },
    [defaultForm, formFields, onEditRow],
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSaving(true);

      try {
        let payload = preparePayload
          ? preparePayload(form, editingRow)
          : { ...form };

        // Handle date fields
        if (payload.valid_from && payload.valid_to) {
          payload.valid_from = new Date(payload.valid_from).toISOString();
          payload.valid_to = new Date(payload.valid_to).toISOString();
        }

        // Convert to FormData if file fields exist
        if (fileFields.length > 0) {
          payload = buildFormData(payload, fileFields);
        }

        if (editingRow) {
          const ok = await confirmUpdate({
            title: `Update ${title}`,
            content: "Are you sure you want to save these changes?",
            okText: "Update",
          });
          if (!ok) {
            setSaving(false);
            return;
          }
          await updateItem(editingRow[idKey], payload);
        } else {
          // FIX: Ensure createItem always returns a value
          const result = await createItem(payload);
          if (!result) {
            throw new Error("Create operation returned no result");
          }
        }

        setModalOpen(false);
        load();
        toast.success(
          editingRow ? "Updated successfully" : "Created successfully",
        );
      } catch (err) {
        console.error("Save failed:", err);
        const message =
          err?.response?.data?.message || err?.message || "Failed to save";
        toast.error(message);
      } finally {
        setSaving(false);
      }
    },
    [
      form,
      editingRow,
      preparePayload,
      fileFields,
      title,
      idKey,
      updateItem,
      createItem,
      load,
    ],
  );

  const handleDelete = useCallback(
    async (row) => {
      const ok = await confirmDelete({
        title: `Delete ${title}`,
        content: "This action cannot be undone. Are you sure?",
        okText: "Delete",
        okType: "danger",
      });

      if (!ok) return;

      try {
        await deleteItem(row[idKey]);
        load();
        toast.success("Deleted successfully");
      } catch (err) {
        console.error("Delete failed:", err);
        toast.error(err?.response?.data?.message || "Delete failed");
      }
    },
    [deleteItem, idKey, title, load],
  );

  const handleToggle = useCallback(
    async (row) => {
      try {
        const ok = await confirmToggle({
          title: "Toggle Status",
          content: "Are you sure you want to toggle the status?",
          okText: "Toggle",
        });
        if (!ok) return;

        await toggleStatus(row[idKey]);
        load();
        toast.success("Status toggled successfully");
      } catch (err) {
        console.error("Toggle failed:", err);
        toast.error(err?.response?.data?.message || "Toggle failed");
      }
    },
    [toggleStatus, idKey, load],
  );

  return (
    <div className="min-h-screen p-6">
      <PageHeader
        title={title}
        description={description}
        actionLabel={canCreate && createItem ? createLabel : undefined}
        onAction={canCreate && createItem ? openCreate : undefined}
        extra={
          <div className="flex items-center gap-2">
            {/* FIX: FilterComponent is now a controlled component */}
            {FilterComponent && (
              <FilterComponent
                filterState={filterState}
                setFilterState={handleFilterChange}
              />
            )}
            <button
              type="button"
              onClick={load}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        }
      />

      <div className="border min-h-[400px] border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-4 py-3 text-xs font-bold uppercase text-slate-500 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                {(canEdit || canDelete || toggleStatus) && (
                  <th className="px-4 py-3 text-xs font-bold uppercase text-slate-500 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    <Loader2 className="inline animate-spin mr-2" size={18} />
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="px-4 py-12 text-center text-slate-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={row[idKey]}
                    className="hover:bg-primary-light/40 group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 font-medium text-slate-500"
                      >
                        {col.render ? (
                          col.render(row, { load })
                        ) : col.key === "status" ? (
                          <StatusBadge status={row[col.key]} />
                        ) : col.key === "no" ? (
                          (currentPage - 1) * limit + idx + 1
                        ) : col.key === "is_front" ? (
                          <StatusBadge
                            status={row[col.key] == 1 ? "Yes" : " No"}
                          />
                        ) : (
                          (row[col.key] ?? "—")
                        )}
                      </td>
                    ))}
                    {(canEdit || canDelete || toggleStatus) && (
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          {toggleStatus && (
                            <button
                              type="button"
                              onClick={() => handleToggle(row)}
                              className="p-2 rounded-lg border border-slate-200 hover:border-primary/30 hover:text-primary transition-colors"
                              title="Toggle status"
                            >
                              {row.status === "active" ? (
                                <ToggleRight size={16} />
                              ) : (
                                <ToggleLeft size={16} />
                              )}
                            </button>
                          )}
                          {canEdit && (updateItem || onEditRow) && (
                            <button
                              type="button"
                              onClick={() => openEdit(row)}
                              className="p-2 rounded-lg border border-slate-200 hover:border-primary/30 hover:text-primary transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          {canDelete && deleteItem && (
                            <button
                              type="button"
                              onClick={() => handleDelete(row)}
                              className="p-2 rounded-lg border border-slate-200 hover:border-rose-200 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>

      {/* Edit/Create Modal */}
      {formFields.length > 0 && (createItem || updateItem) && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingRow ? `Edit ${title}` : `Create ${title}`}
          wide={modalWide}
        >
          <form
            onSubmit={handleSubmit}
            className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {formFields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                form={form}
                setForm={setForm}
                editingRow={editingRow}
                idKey={idKey}
              />
            ))}
            <div className="col-span-2 flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving..." : editingRow ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export { buildFormData };
