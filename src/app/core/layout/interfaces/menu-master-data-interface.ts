export interface MenuItem {
  label: string;
  path: string;
}

export interface MenuSection {
  label: string;
  isActive: boolean;
  items: MenuItem[];
}

export interface MainMenu {
  label: string;
  icon: string;
  items: MenuSection[];
}