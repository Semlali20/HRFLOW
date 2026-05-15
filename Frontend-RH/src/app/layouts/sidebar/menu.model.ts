export interface MenuItem {
  label: string;
  link?: string;
  icon?: string;
  subItems?: MenuItem[];
  isTitle?: boolean;
  permission?: string;       // required permission key; absent = always visible
  badge?: {
    variant: string;
    text: string;
  };
}
