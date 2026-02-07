export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  location: ProductLocation;
  description: string;
  importance: string;
  dailyLifeUses: string;
  howToUse: string;
  ingredients: string;
  culturalBackground: string;
  whereToFind: string;
  price?: string;
  images: string[];
  availability: 'available' | 'limited' | 'seasonal' | 'unavailable';
  featured?: boolean;
  trending?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface ProductLocation {
  country: string;
  state: string;
  district: string;
  localArea: string;
}

export interface CommunitySubmission {
  id: string;
  productName: string;
  location: string;
  usageDetails: string;
  submittedBy: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'herbal-medicine',
    name: 'Herbal Medicine',
    icon: '🌿',
    description: 'Traditional healing remedies from nature',
    color: 'sage',
  },
  {
    id: 'local-food',
    name: 'Local Food',
    icon: '🍲',
    description: 'Authentic regional cuisines and ingredients',
    color: 'amber',
  },
  {
    id: 'handicrafts',
    name: 'Handicrafts',
    icon: '🎨',
    description: 'Handmade artisanal creations',
    color: 'terracotta',
  },
  {
    id: 'art-artists',
    name: 'Art & Artists',
    icon: '🖌️',
    description: 'Local art forms and creators',
    color: 'primary',
  },
  {
    id: 'historical-books',
    name: 'Historical Books',
    icon: '📚',
    description: 'Rare manuscripts and cultural texts',
    color: 'secondary',
  },
  {
    id: 'traditional-tools',
    name: 'Traditional Tools',
    icon: '⚒️',
    description: 'Heritage implements and equipment',
    color: 'muted',
  },
  {
    id: 'cultural-products',
    name: 'Cultural Products',
    icon: '🏺',
    description: 'Items of cultural significance',
    color: 'accent',
  },
];
