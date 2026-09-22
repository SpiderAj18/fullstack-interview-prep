import { CategoryType } from "@prisma/client";

export type DefaultCategoryChild = {
  name: string;
  color?: string;
  icon?: string;
  sortOrder: number;
};

export type DefaultCategoryParent = {
  name: string;
  type: CategoryType;
  color?: string;
  icon?: string;
  sortOrder: number;
  children?: DefaultCategoryChild[];
};

export const DEFAULT_CATEGORIES: DefaultCategoryParent[] = [
  {
    name: "Food",
    type: CategoryType.EXPENSE,
    color: "#F97316",
    icon: "food",
    sortOrder: 10,
    children: [
      { name: "Grocery", color: "#FB923C", icon: "grocery", sortOrder: 11 },
      { name: "Restaurant", color: "#FDBA74", icon: "restaurant", sortOrder: 12 },
    ],
  },
  {
    name: "Transport",
    type: CategoryType.EXPENSE,
    color: "#3B82F6",
    icon: "transport",
    sortOrder: 20,
    children: [
      { name: "Fuel", color: "#60A5FA", icon: "fuel", sortOrder: 21 },
      { name: "Cab", color: "#93C5FD", icon: "cab", sortOrder: 22 },
      { name: "Public Transport", color: "#BFDBFE", icon: "public_transport", sortOrder: 23 },
    ],
  },
  {
    name: "Shopping",
    type: CategoryType.EXPENSE,
    color: "#A855F7",
    icon: "shopping",
    sortOrder: 30,
  },
  {
    name: "Bills",
    type: CategoryType.EXPENSE,
    color: "#EF4444",
    icon: "bills",
    sortOrder: 40,
  },
  {
    name: "Housing",
    type: CategoryType.EXPENSE,
    color: "#78716C",
    icon: "housing",
    sortOrder: 50,
  },
  {
    name: "Health",
    type: CategoryType.EXPENSE,
    color: "#22C55E",
    icon: "health",
    sortOrder: 60,
  },
  {
    name: "Entertainment",
    type: CategoryType.EXPENSE,
    color: "#EC4899",
    icon: "entertainment",
    sortOrder: 70,
  },
  {
    name: "Education",
    type: CategoryType.EXPENSE,
    color: "#0EA5E9",
    icon: "education",
    sortOrder: 80,
  },
  {
    name: "Travel",
    type: CategoryType.EXPENSE,
    color: "#14B8A6",
    icon: "travel",
    sortOrder: 90,
  },
  {
    name: "Subscriptions",
    type: CategoryType.EXPENSE,
    color: "#8B5CF6",
    icon: "subscriptions",
    sortOrder: 100,
  },
  {
    name: "Personal Care",
    type: CategoryType.EXPENSE,
    color: "#F43F5E",
    icon: "personal_care",
    sortOrder: 110,
  },
  {
    name: "Other",
    type: CategoryType.EXPENSE,
    color: "#64748B",
    icon: "other",
    sortOrder: 120,
  },
  {
    name: "Salary",
    type: CategoryType.INCOME,
    color: "#16A34A",
    icon: "salary",
    sortOrder: 10,
  },
  {
    name: "Freelance",
    type: CategoryType.INCOME,
    color: "#059669",
    icon: "freelance",
    sortOrder: 20,
  },
  {
    name: "Business",
    type: CategoryType.INCOME,
    color: "#0D9488",
    icon: "business",
    sortOrder: 30,
  },
  {
    name: "Interest",
    type: CategoryType.INCOME,
    color: "#0891B2",
    icon: "interest",
    sortOrder: 40,
  },
  {
    name: "Cashback",
    type: CategoryType.INCOME,
    color: "#0284C7",
    icon: "cashback",
    sortOrder: 50,
  },
  {
    name: "Other",
    type: CategoryType.INCOME,
    color: "#64748B",
    icon: "other_income",
    sortOrder: 60,
  },
];
