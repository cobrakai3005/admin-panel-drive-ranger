// import { Plus } from "lucide-react";

// export default function PageHeader({
//   title,
//   description,
//   actionLabel,
//   onAction,
//   extra,
// }) {
//   return (
//     <div className="flex  flex-col  w-full md:justify-between  gap-4 mb-6">
//       <div>
//         <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
//         {description && (
//           <p className="text-slate-500 text-sm mt-1">{description}</p>
//         )}
//       </div>
//       <div className="flex justify-between  items-center gap-3">
//         {extra}
//         {actionLabel && onAction && (
//           <button
//             type="button"
//             onClick={onAction}
//             className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
//           >
//             <Plus size={18} />
//             {actionLabel}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }

import { Plus } from "lucide-react";

export default function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  extra,
}) {
  return (
    <div className="mb-5 w-full space-y-4 sm:mb-6">
      {/* Title and description */}
      <div className="min-w-0">
        <h1 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {/* Filters and action button */}
      {(extra || (actionLabel && onAction)) && (
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          {/* Filters, refresh, deleted button, etc. */}
          {extra && (
            <div className="min-w-0 w-full sm:w-auto sm:flex-1">{extra}</div>
          )}

          {/* Add button */}
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="
                inline-flex w-full items-center justify-center gap-2
                rounded-xl bg-primary px-4 py-2.5
                text-sm font-semibold text-white shadow-sm
                transition-colors hover:bg-primary/90
                sm:w-auto sm:shrink-0
              "
            >
              <Plus size={18} />
              <span className="truncate">{actionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
