'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Loader2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { toast } from 'sonner';
import CategoryModal from './CategoryModal';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  parentId: string | null;
  children?: Category[];
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const pageSize = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.data);
      }
    } catch (error) {
      toast.error('Lỗi khi tải danh mục');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả các danh mục con cũng sẽ bị ảnh hưởng.')) {
      try {
        const res = await api.delete(`/categories/${id}`);
        if (res.data.success) {
          toast.success('Xóa danh mục thành công');
          fetchCategories();
        }
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Lỗi khi xóa danh mục';
        toast.error(errorMessage);
      }
    }
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditCategory(null);
    setIsModalOpen(true);
  };

  const flattenCategories = (cats: Category[]): Category[] => {
    let result: Category[] = [];
    cats.forEach((cat) => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children));
      }
    });
    return result;
  };

  const filteredCategories = flattenCategories(categories).filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const visibleCategories = searchTerm ? filteredCategories : categories;
  const totalPages = Math.max(1, Math.ceil(visibleCategories.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedCategories = visibleCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  return (
    <div className="admin-page">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý cấu trúc phân cấp các loại sản phẩm trên hệ thống.</p>
        </div>
        <Button onClick={handleAdd} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Thêm danh mục
        </Button>
      </div>

      <div className="admin-toolbar justify-start">
        <div className="relative w-full max-w-md">
          <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc đường dẫn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input pl-10 pr-4 py-2.5"
          />
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Đang tải cấu trúc danh mục...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <FolderTree className="w-12 h-12 text-muted-foreground opacity-20" />
            <p className="text-sm font-medium text-muted-foreground">Chưa có danh mục nào được tạo.</p>
            <Button variant="outline" onClick={handleAdd}>Tạo danh mục đầu tiên</Button>
          </div>
        ) : visibleCategories.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <Search className="w-10 h-10 text-muted-foreground opacity-30" />
            <p className="text-sm font-medium text-muted-foreground">Không tìm thấy danh mục phù hợp.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[96px_minmax(260px,1fr)_140px_180px] items-center gap-4 border-b border-border bg-secondary/40 px-4 py-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                <span>Ảnh</span>
                <span>Tên danh mục / đường dẫn</span>
                <span>Cấp danh mục</span>
                <span className="text-right">Thao tác</span>
              </div>

              <div className="p-3 sm:p-4 space-y-2">
                {paginatedCategories.map((cat) => (
                  <CategoryItem
                    key={cat.id}
                    category={cat}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    depth={0}
                    isSearchResult={!!searchTerm}
                  />
                ))}
              </div>

              <div className="admin-pagination border-t border-border">
                <span>
                  Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, visibleCategories.length)} của {visibleCategories.length} danh mục
                </span>
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-3 py-1.5 rounded-[var(--radius-md)] font-medium ${
                        currentPage === pageNum ? 'bg-primary text-primary-foreground' : 'border border-border hover:bg-secondary transition-colors'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1.5 rounded-[var(--radius-md)] border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    Tiếp
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditCategory(null); }}
        onSuccess={fetchCategories}
        category={editCategory}
        allCategories={flattenCategories(categories)}
      />
    </div>
  );
}

function CategoryItem({
  category,
  onEdit,
  onDelete,
  depth,
  isSearchResult = false,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  depth: number;
  isSearchResult?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="space-y-1">
      <div
        className={`grid grid-cols-[96px_minmax(260px,1fr)_140px_180px] items-center gap-4 p-3 rounded-[8px] border transition-all ${
          depth === 0 ? 'bg-secondary/30 border-border' : 'bg-transparent border-transparent hover:bg-secondary/20'
        }`}
      >
        <div className="w-14 h-14 rounded-[var(--radius-md)] overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0">
          {category.image ? (
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] font-semibold text-muted-foreground">No img</span>
          )}
        </div>

        <div className="flex items-center gap-3 min-w-0" style={{ paddingLeft: `${depth * 28}px` }}>
          {!isSearchResult && hasChildren ? (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-1 hover:bg-secondary rounded-md transition-colors"
              aria-label={isOpen ? 'Thu gọn danh mục con' : 'Mở danh mục con'}
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className={`p-1.5 rounded-md shrink-0 ${depth === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            <FolderTree className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{category.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono truncate">{category.slug}</p>
          </div>
        </div>

        <div>
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${depth === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            {isSearchResult ? 'Kết quả tìm kiếm' : depth === 0 ? 'Danh mục chính' : `Danh mục con cấp ${depth}`}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(category)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[var(--radius-md)] transition-all"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
            <span>Sửa</span>
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-[var(--radius-md)] transition-all"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa</span>
          </button>
        </div>
      </div>

      {!isSearchResult && hasChildren && isOpen && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
