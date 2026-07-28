// ─────────────────────────────────────────────
//  Zustand Store — Categories
// ─────────────────────────────────────────────
import {create} from 'zustand';
import {Category, CategoryType} from '../types';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  softDeleteCategory,
} from '../database/queries/categoryQueries';

interface CategoryState {
  categories: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  fetchCategories: () => void;
  addCategory: (name: string, type: CategoryType, icon_name: string) => void;
  editCategory: (id: number, name: string, icon_name: string) => void;
  removeCategory: (id: number) => void;
}

export const useCategoryStore = create<CategoryState>(set => ({
  categories: [],
  incomeCategories: [],
  expenseCategories: [],

  fetchCategories: () => {
    const categories = getAllCategories();
    set({
      categories,
      incomeCategories: categories.filter(c => c.type === 'INCOME'),
      expenseCategories: categories.filter(c => c.type === 'EXPENSE'),
    });
  },

  addCategory: (name, type, icon_name) => {
    createCategory(name, type, icon_name);
    const categories = getAllCategories();
    set({
      categories,
      incomeCategories: categories.filter(c => c.type === 'INCOME'),
      expenseCategories: categories.filter(c => c.type === 'EXPENSE'),
    });
  },

  editCategory: (id, name, icon_name) => {
    updateCategory(id, name, icon_name);
    const categories = getAllCategories();
    set({
      categories,
      incomeCategories: categories.filter(c => c.type === 'INCOME'),
      expenseCategories: categories.filter(c => c.type === 'EXPENSE'),
    });
  },

  removeCategory: id => {
    softDeleteCategory(id);
    const categories = getAllCategories();
    set({
      categories,
      incomeCategories: categories.filter(c => c.type === 'INCOME'),
      expenseCategories: categories.filter(c => c.type === 'EXPENSE'),
    });
  },
}));
