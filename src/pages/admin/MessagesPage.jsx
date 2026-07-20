import CrudPage from "../../components/shared/CrudPage";
import {
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
} from "../../api/messages";
import { useState } from "react";
import Modal from "../../components/shared/Modal";
import { Eye, Loader2 } from "lucide-react";
import { useEffect } from "react";

const defaultForm = {
  full_name: "",
  email: "",
  phone: "",
  car_model: "",
  car_year: "",
  message: "",
};

function MessageFilter({ filterState, setFilterState }) {
  const [searchInput, setSearchInput] = useState(filterState.search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filterState.search) {
        setFilterState((prev) => ({ ...prev, search: searchInput }));
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <div className="grid grid-cols-1   gap-3">
      <input
        type="text"
        placeholder="Search by name, email, phone, car model..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        className="px-3 py-2 rounded-xl border border-slate-200 text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
      />
    </div>
  );
}

export default function MessagesPage() {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const handleViewDetails = async (row) => {
    setViewLoading(true);
    setViewModalOpen(true);
    try {
      const res = await getMessageById(row.id);
      setViewData(res.data);
    } catch {
      setViewData(null);
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <>
      <CrudPage
        title="Messages"
        description="Customer inquiries and contact messages"
        idKey="id"
        canCreate={false}
        canEdit={true}
        canDelete={true}
        defaultForm={defaultForm}
        fetchList={(page, filters) =>
          getMessages({
            page,
            limit: 10,
            search: filters.search || "",
          })
        }
        updateItem={updateMessage}
        deleteItem={deleteMessage}
        deleteEntityLabel="Message"
        FilterComponent={MessageFilter}
        columns={[
          { key: "no", label: "#" },
          { key: "full_name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "phone", label: "Phone" },
          { key: "car_model", label: "Car Model" },
          {
            key: "car_year",
            label: "Year",
            render: (r) => r.car_year || "—",
          },
          {
            key: "message",
            label: "Message",
            render: (r) => (
              <span className="line-clamp-2 text-slate-500 max-w-xs">
                {r.message}
              </span>
            ),
          },
          {
            key: "created_at",
            label: "Date",
            render: (r) => new Date(r.created_at).toLocaleDateString(),
          },
          {
            key: "view",
            label: "",
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
        ]}
        formFields={[
          { name: "full_name", label: "Full Name", colSpan: 2, required: true },
          { name: "email", label: "Email", colSpan: 2, required: true },
          { name: "phone", label: "Phone" },
          { name: "car_model", label: "Car Model" },
          { name: "car_year", label: "Car Year", type: "number" },
          {
            name: "message",
            label: "Message",
            type: "textarea",
            colSpan: 2,
            required: true,
          },
        ]}
      />

      <Modal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewData(null);
        }}
        title="Message Details"
        wide
      >
        {viewLoading ? (
          <div className="p-8 flex items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading...
          </div>
        ) : viewData ? (
          <div className="p-4 md:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Name
                </p>
                <p className="font-medium text-slate-900">
                  {viewData.full_name}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Email
                </p>
                <p className="font-medium text-slate-900">{viewData.email}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Phone
                </p>
                <p className="font-medium text-slate-900">
                  {viewData.phone || "—"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Car Model
                </p>
                <p className="font-medium text-slate-900">
                  {viewData.car_model || "—"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Car Year
                </p>
                <p className="font-medium text-slate-900">
                  {viewData.car_year || "—"}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                  Submitted
                </p>
                <p className="font-medium text-slate-900">
                  {new Date(viewData.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">
                Message
              </h4>
              <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-4 whitespace-pre-wrap">
                {viewData.message}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400">
            Failed to load message details.
          </div>
        )}
      </Modal>
    </>
  );
}
