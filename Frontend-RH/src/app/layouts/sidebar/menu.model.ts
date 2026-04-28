export interface MenuItem {
  label: string;
  link?: string;
  icon?: string;
  subItems?: MenuItem[];
  isTitle?: boolean;
  badge?: {
    variant: string;
    text: string;
  };
}
