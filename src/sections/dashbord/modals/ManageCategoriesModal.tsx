import React, { useEffect, useState } from 'react';
import useLocales from '@/locales/use-locales';
import { Category, SubCategory } from '@/types/category';
import { useGetCategories } from '@/api/categories/get-all-categories';
import { usePostCategory } from '@/api/categories/post-category';
import { ModalShell } from '@/sections/dashbord/components/common/ModalShell';
import { CategoriesModalHeader } from './categories/CategoriesModalHeader';
import { CategoriesPane } from './categories/CategoriesPane';
import { SubcategoriesPane } from './categories/SubcategoriesPane';
import type { NewCategoryValues } from './categories/AddCategoryForm';
import type { NewSubcategoryValues } from './categories/AddSubcategoryForm';
import { toast } from 'sonner';
import { usePostSubcategory } from '@/api/categories/post-subcategory';
import { useUpdateSubcategory } from '@/api/categories/update-subcategory';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoriesUpdated?: (categories: Category[]) => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  onCategoriesUpdated,
}) => {
  const { t } = useLocales();
  const { data: categoriesData } = useGetCategories();
  const { mutateAsync: postSubcategory } = usePostSubcategory();
  const { mutateAsync: updateSubcategory } = useUpdateSubcategory();
  const { mutateAsync: postCategory } = usePostCategory();

  const [categories, setCategories] = useState<Category[]>(categoriesData ?? []);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  const [categorySearch, setCategorySearch] = useState('');
  const [subcategorySearch, setSubcategorySearch] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingSubcategory, setIsAddingSubcategory] = useState(false);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  // categoriesData loads asynchronously, so sync local state once it arrives.
  useEffect(() => {
    if (!categoriesData) return;
    setCategories(categoriesData);
    setSelectedCategoryId((prev) => prev || categoriesData[0]?.id || '');
  }, [categoriesData]);

  if (!isOpen) return null;

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || categories[0];

  const filteredCategories = (categoriesData ?? []).filter((c) =>
    c.title?.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const filteredSubcategories = (selectedCategory?.subcategories || []).filter((s) => {
    const label = (s as SubCategory & { name?: string }).name ?? s.title ?? '';
    return label.toLowerCase().includes(subcategorySearch.toLowerCase().trim());
  });

  const commit = (updated: Category[]) => {
    setCategories(updated);
    onCategoriesUpdated?.(updated);
  };

  const updateSelectedSubs = (fn: (subs: SubCategory[]) => SubCategory[]) =>
    commit(
      categories.map((cat) =>
        cat.id === selectedCategory.id ? { ...cat, subcategories: fn(cat.subcategories) } : cat
      )
    );

  const handleAddCategory = ({ name, icon, description }: NewCategoryValues) => {
    const newCategory: Partial<Category> = {
      title: name,
      icon,
      description: description || t('curatedProductsFor', { name }),
    };

    postCategory(newCategory).then(() => {
      toast.success(t('categoryAdded'));
      setIsAddingCategory(false);
    }).catch(() => {
      toast.error(t('categoryAddFailed'));
    });
  };

  const handleDeleteCategory = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (categories.length <= 1) {
      alert(t('mustKeepOneCategory'));
      return;
    }
    if (window.confirm(t('confirmDeleteCategory'))) {
      const updated = categories.filter((c) => c.id !== catId);
      commit(updated);
      if (selectedCategoryId === catId) setSelectedCategoryId(updated[0]?.id || '');
    }
  };

  const handleAddSubcategory = ({ name, description, markup }: NewSubcategoryValues) => {
    if (!selectedCategory) {
      toast.error(t('noCategorySelected'));
      return;
    }

    const actualCategory: Category = categories.find((c) => c.id === selectedCategoryId) || categories[0];

    const newSub = {
      title: name,
      description,
      category: actualCategory['@id'],
      markup,
    };
    postSubcategory(newSub).then(() => {
      toast.success(t('subcategoryAdded'));
    }).catch(() => {
      toast.error(t('subcategoryAddFailed'));
    });
  };

  const handleDeleteSubcategory = (subId: string) => {
    if (selectedCategory && window.confirm(t('confirmDeleteSubcategory'))) {
      updateSelectedSubs((subs) => subs.filter((s) => s.id !== subId));
    }
  };

  const handleSaveEditSubcategory = (id: string, updatedSub: Partial<SubCategory>) => {
    const { title, description, markup } = updatedSub;
    updateSubcategory({ subcategoryId: Number(id), data: { title, description, markup } })
      .then(() => {
        toast.success(t('subcategoryUpdated'));
        setEditingSubId(null);
      })
      .catch(() => {
        toast.error(t('subcategoryUpdateFailed'));
      });
  };

  return (
    <ModalShell isOpen={isOpen} onClose={onClose} className="max-w-5xl h-[90vh] max-h-[820px]">
      <CategoriesModalHeader
        categoryCount={categoriesData?.length}
        subcategoryCount={categoriesData?.reduce((acc, c) => acc + c.subcategories.length, 0)}
        skuCount={categoriesData?.reduce(
          (acc, c) => acc + c.subcategories.reduce((subAcc, s) => subAcc + s.productLength, 0),
          0
        )}
        onClose={onClose}
      />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <CategoriesPane
          categories={filteredCategories}
          totalCount={categoriesData?.length}
          selectedCategoryId={selectedCategoryId}
          search={categorySearch}
          onSearchChange={setCategorySearch}
          isAdding={isAddingCategory}
          onToggleAdding={setIsAddingCategory}
          onSelect={setSelectedCategoryId}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
        />

        {selectedCategory && (
          <SubcategoriesPane
            category={selectedCategory}
            subcategories={filteredSubcategories}
            search={subcategorySearch}
            onSearchChange={setSubcategorySearch}
            isAdding={isAddingSubcategory}
            onToggleAdding={setIsAddingSubcategory}
            onAdd={handleAddSubcategory}
            editingId={editingSubId}
            onStartEdit={setEditingSubId}
            onSaveEdit={handleSaveEditSubcategory}
            onCancelEdit={() => setEditingSubId(null)}
            onDelete={handleDeleteSubcategory}
            onClose={onClose}
          />
        )}
      </div>
    </ModalShell>
  );
};
