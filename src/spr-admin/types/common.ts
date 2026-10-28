export interface SelectOption<TValue = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavItem[];
}

export type SortOrder = "asc" | "desc";
