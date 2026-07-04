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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);

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

  // Flatten the tree for search but we'll display a nested list
  const flattenCategories = (cats: Category[]): Category[] => {
    let result: Category[] = [];
    cats.forEach(cat => {
      result.push(cat);
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children));
      }
    });
    return result;
  };

  const filteredCategories = flattenCategories(categories).filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Danh mục sản phẩm</h1>
          <p className="text-sm text-muted-foreground mt-1">Quản lý cấu trúc phân cấp các loại sản phẩm trên hệ thống.</p>
        </div>
        <Button onClick={handleAdd} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" /> Thêm danh mục
        </Button>
      </div>

      <div className="card-elevated p-4 rounded-[var(--radius-xl)] bg-card border border-border">
        <div className="relative max-w-md">
          <Search className="w-4.5 h-4.5 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm danh mục..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-secondary/50 border border-border rounded-[var(--radius-lg)] pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
          />
        </div>
      </div>

      <div className="card-elevated rounded-[var(--radius-xl)] border border-border overflow-hidden bg-card">
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
        ) : (
          <div className="p-4 space-y-2">
            {categories.map((cat) => (
              <CategoryItem 
                key={cat.id} 
                category={cat} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                depth={0}
              />
            ))}
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

function CategoryItem({ category, onEdit, onDelete, depth }: { 
  category: Category; 
  onEdit: (c: Category) => void; 
  onDelete: (id: string) => void;
  depth: number;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="space-y-1">
      <div 
        className={`flex items-center justify-between p-3 rounded-[var(--radius-lg)] border transition-all ${
          depth === 0 ? 'bg-secondary/30 border-border' : 'bg-transparent border-transparent hover:bg-secondary/20'
        }`}
        style={{ marginLeft: `${depth * 24}px` }}
      >
        <div className="flex items-center gap-3">
          {hasChildren ? (
            <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-secondary rounded-md transition-colors">
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <div className="w-6" />
          )}
          <div className={`p-1.5 rounded-md ${depth === 0 ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
            <FolderTree className="w-4 h-4" />
          </div>
          <div className="w-14 h-14 rounded-[var(--radius-md)] overflow-hidden bg-secondary border border-border flex items-center justify-center shrink-0">
            {category.image ? (
              <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[10px] font-semibold text-muted-foreground">No img</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{category.name}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{category.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 rounded-full p-1">
          {/* Action buttons are visible on hover in a real editorial UI, but for ease of use we can keep them visible or subtle */}
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(category)}
            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-[var(--radius-md)] transition-all"
            title="Sửa"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(category.id)}
            className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-[var(--radius-md)] transition-all"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {hasChildren && isOpen && (
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
