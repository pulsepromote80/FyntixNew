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
  img?: string;
  isDropdown?: boolean;
  dropdownItems?: DropdownItem[];
  children?: NavItem[];
}

export interface DropdownItem {
  label: string;
  href: string;
}

export type SortOrder = "asc" | "desc";
