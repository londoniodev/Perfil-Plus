// Data Table Components - Generic & Reusable
// ============================================

export { DataTable, type DataTableInstance } from "./data-table"
export { DataTablePagination } from "./data-table-pagination"
export { DataTableColumnHeader } from "./data-table-column-header"
export { DataTableViewOptions } from "./data-table-view-options"
export { DataTableRowActions } from "./data-table-row-actions"

// Re-export commonly used TanStack Table types for convenience
// Note: We don't re-export Table as it conflicts with our Table component
export type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    Row,
    Column,
    RowSelectionState,
} from "@tanstack/react-table"
