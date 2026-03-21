// ============================================================================
// @alvarosky/ui
// Shared UI components for the Mauro Mera platform
// ============================================================================

// Utilities
export * from "./lib/utils";

// Core Components
export * from "./button";
export * from "./input";
export * from "./textarea";
export * from "./label";
export * from "./card";

// Display
export * from "./avatar";
export * from "./badge";
export * from "./separator";
export * from "./aspect-ratio";
export * from "./progress";

// Form
export * from "./form";
export * from "./select";
export * from "./switch";
export * from "./slider";

// Navigation & Layout
export * from "./tabs";
export * from "./accordion";
export * from "./sheet";
export * from "./navigation";
export * from "./sidebar";
export * from "./table";

// Feedback
export * from "./toast";

// Icons
export * from "./icons";

// Data Display
// Enhanced DataTable components with pagination, sorting, etc.
export {
    DataTable,
    DataTablePagination,
    DataTableColumnHeader,
    DataTableViewOptions,
    DataTableRowActions,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type Row,
    type Column,
    type RowSelectionState,
} from "./components/data-table";
export * from "./pagination";
export * from "./status-badge";
export * from "./filter-tabs";

// Client Utilities
export * from "./client-toast";
export * from "./premium-lock";
export * from "./theme-toggle";

// Blog Components
export * from "./components/blog/blog-card";
export * from "./page-header";
export * from "./adaptive-image";
export * from "./skeleton";
export * from "./post-header-blog";
export * from "./related-topics";
export * from "./share-buttons";
export * from "./table-of-contents";
export * from "./tooltip";

// Shadcn UI Components
export * from "./alert";
export * from "./alert-dialog";
export * from "./breadcrumb";
export * from "./checkbox";
export * from "./collapsible";
export * from "./command";
export * from "./context-menu";
export * from "./dialog";
export * from "./drawer";
export * from "./dropdown-menu";
export * from "./hover-card";
export * from "./popover";
export * from "./radio-group";
export * from "./scroll-area";

// E-commerce Components
export * from "./price-display";
export * from "./product-specs";
export * from "./product-card";
export * from "./components/commerce/product-action-button";
export * from "./components/commerce/products-table";
export * from "./components/commerce/order-details-sheet";
export * from "./components/commerce/orders-table";
export * from "./components/commerce/cart-sheet";
export * from "./components/commerce/product-configurator";
export * from "./components/commerce/product-modal";

// Upload Components
export * from "./components/upload";
export * from "./components/SingleImageDropzone";
export * from "./components/YouTubeEmbedInput";
export * from "./components/PrivateDocumentDropzone";

// Admin Components
export * from "./components/admin";
export * from "./layouts/admin-layout";

// Content Components (Blog/Editor)
export * from "./components/content";

// LMS Components
export * from "./components/lms";

// Auth Components
export * from "./components/auth";

// Subscription Components
export * from "./components/subscription";

// Hooks
export * from "./hooks/use-mobile";
export * from "./hooks/use-scroll";
export * from "./hooks/use-digital-product";
export * from "./hooks/use-product-modifiers";
export * from "./hooks/use-product-social";
export * from "./hooks/useFileUpload";

// Layouts (Admin Panel Components)
export * from "./layouts";

// Layout Components (Footer, Carousel, Fill)
export * from "./components/layout";
export * from "./components/layout/fill";

// Marketing Components
export * from "./components/marketing";


// Providers
export * from "./providers/brand-provider";
export * from "./lib/themes";

// Fonts (for app layouts)
export * from "./lib/fonts";

// CSS Styles (import in app layout)
// import "@alvarosky/ui/globals.css";


