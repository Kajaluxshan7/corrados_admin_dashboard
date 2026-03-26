export interface PrimaryCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  categories?: MenuCategory[];
}

export interface MenuCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  primaryCategoryId?: string;
  primaryCategory?: PrimaryCategory;
  menuItems?: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuItemMeasurement {
  id?: string;
  measurementTypeId?: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  preparationTime?: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  allergens: string[];
  imageUrls: string[];
  sortOrder: number;
  createdAt: Date;
  hasMeasurements?: boolean;
  measurements?: MenuItemMeasurement[];
}

export interface MeasurementType {
  id: string;
  name: string;
}

export type DrawerFormType = 'primaryCategory' | 'category' | 'item';
export type MenuView = 'overview' | 'categories' | 'items';
