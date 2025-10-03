import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FolderOpen, Package, Plus, Search, Upload, 
  Edit3, Trash2, ChevronRight, ChevronDown, Eye, EyeOff,
  RefreshCw, X
} from 'lucide-react';

interface Category {
  id: number;
  name_ar: string;
  name_en: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  level: number;
  full_path?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  provider_id?: number;
  external_id?: string;
  category_id?: number;
  name_ar: string;
  name_en: string;
  description?: string;
  price: number;
  base_price?: number;
  image_url?: string;
  product_type: string;
  status: string;
  qty_values?: string;
  params?: string;
  available: boolean;
  is_active: boolean;
  service_type: string;
  min_quantity: number;
  max_quantity: number;
  created_at: string;
  updated_at: string;
  category_name_ar?: string;
  category_name_en?: string;
}

interface Provider {
  id: number;
  name: string;
  api_url: string;
  api_token: string;
  is_active: boolean;
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

interface ImportCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  children?: ImportCategory[];
  products?: ImportProduct[];
}

interface ImportProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  qty_values?: string;
  params?: string;
}

const CatalogManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  
  // Modals state
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Import state
  const [importStep, setImportStep] = useState<'provider' | 'categories'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [importCategories, setImportCategories] = useState<ImportCategory[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  const [importProgress, setImportProgress] = useState<string[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes, providersRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch('/api/admin/products'),
        fetch('/api/admin/providers')
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData);
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData);
      }

      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setProviders(providersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { destination, draggableId } = result;
    const productId = parseInt(draggableId.replace('product-', ''));
    const newCategoryId = destination.droppableId === 'uncategorized' 
      ? undefined
      : parseInt(destination.droppableId.replace('category-', ''));

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: newCategoryId
        }),
      });

      if (response.ok) {
        setProducts(prev => 
          prev.map(product => 
            product.id === productId 
              ? { ...product, category_id: newCategoryId }
              : product
          )
        );
      }
    } catch (error) {
      console.error('Error moving product:', error);
    }
  };

  // Category operations
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategory(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`هل أنت متأكد من حذف الفئة "${category.name_ar}"؟ سيتم حذف جميع الفئات الفرعية والمنتجات التابعة لها.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ في الحذف');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      const isEdit = !!editingCategory;
      const url = isEdit 
        ? `/api/admin/categories/${editingCategory!.id}`
        : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        setShowEditCategory(false);
        setEditingCategory(null);
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ في الحفظ');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('حدث خطأ في الحفظ');
    }
  };

  // Product operations
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowEditProduct(true);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`هل أنت متأكد من حذف المنتج "${product.name_ar}"؟`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ في الحذف');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      const isEdit = !!editingProduct;
      const url = isEdit 
        ? `/api/admin/products/${editingProduct!.id}`
        : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setShowEditProduct(false);
        setEditingProduct(null);
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'حدث خطأ في الحفظ');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('حدث خطأ في الحفظ');
    }
  };

  // Import operations
  const handleStartImport = () => {
    setImportStep('provider');
    setSelectedProvider(null);
    setImportCategories([]);
    setImportProgress([]);
    setShowImportModal(true);
  };

  const buildCategoryTree = async (provider: Provider): Promise<ImportCategory[]> => {
    setImportLoading(true);
    setImportProgress([`🌳 بدء بناء شجرة التصنيفات الكاملة للمزود ${provider.name}...`]);

    try {
      setImportProgress(prev => [...prev, '📂 جلب الفئات الرئيسية...']);
      const mainResponse = await fetch('/api/admin/providers/fetch-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: provider.id })
      });

      if (!mainResponse.ok) {
        const errorData = await mainResponse.json();
        throw new Error(errorData.error || 'فشل في جلب الفئات الرئيسية');
      }

      const mainCategories = await mainResponse.json();

      if (!Array.isArray(mainCategories)) {
        throw new Error('البيانات المستلمة غير صحيحة. يرجى التحقق من رابط API والـ Token');
      }

      setImportProgress(prev => [...prev, `✅ تم جلب ${mainCategories.length} فئة رئيسية`]);

      // Build complete tree recursively
      const tree: ImportCategory[] = [];
      
      for (const category of mainCategories) {
        const categoryNode = await buildCategoryNode(provider, category, 0);
        tree.push(categoryNode);
      }

      setImportProgress(prev => [...prev, '🎉 تم بناء الشجرة الكاملة بنجاح!']);
      return tree;

    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      setImportProgress(prev => [...prev, `❌ خطأ في بناء الشجرة: ${errorMessage}`]);
      throw error;
    } finally {
      setImportLoading(false);
    }
  };

  const buildCategoryNode = async (provider: Provider, category: any, depth: number): Promise<ImportCategory> => {
    const indent = '  '.repeat(depth);
    setImportProgress(prev => [...prev, `${indent}📁 معالجة: ${category.name}`]);

    try {
      // Get subcategories and products for this category
      const contentResponse = await fetch('/api/admin/providers/fetch-category-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          providerId: provider.id, 
          categoryId: category.id 
        })
      });

      const node: ImportCategory = {
        id: category.id.toString(),
        name: category.name,
        description: category.description,
        children: [],
        products: []
      };

      if (contentResponse.ok) {
        const content = await contentResponse.json();
        
        // Add subcategories
        if (content.categories && content.categories.length > 0) {
          setImportProgress(prev => [...prev, `${indent}  📂 ${content.categories.length} فئة فرعية`]);
          for (const subCategory of content.categories) {
            const subNode = await buildCategoryNode(provider, subCategory, depth + 1);
            node.children!.push(subNode);
          }
        }

        // Add products
        if (content.products && content.products.length > 0) {
          setImportProgress(prev => [...prev, `${indent}  📦 ${content.products.length} منتج`]);
          node.products = content.products.map((product: any) => ({
            id: product.id.toString(),
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            category_id: category.id.toString(),
            qty_values: product.qty_values,
            params: product.params
          }));
        }
      }

      return node;

    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      setImportProgress(prev => [...prev, `${indent}❌ خطأ في معالجة ${category.name}: ${errorMessage}`]);
      throw error;
    }
  };

  const handleProviderSelect = async (provider: Provider) => {
    setSelectedProvider(provider);

    try {
      const tree = await buildCategoryTree(provider);
      setImportCategories(tree);
      setImportStep('categories');
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      console.error('Error building tree:', errorMessage);
      alert(`حدث خطأ في بناء شجرة التصنيفات:\n${errorMessage}\n\nيرجى التحقق من:\n1. رابط API صحيح\n2. Token صحيح وفعال\n3. اتصال الإنترنت`);
    }
  };

  const handleImportCategory = async (category: ImportCategory) => {
    if (!confirm(`هل تريد استيراد الفئة "${category.name}" وكل ما تحتويه؟`)) {
      return;
    }

    setImportLoading(true);
    setImportProgress(['🚀 بدء عملية الاستيراد...']);

    try {
      const response = await fetch('/api/admin/providers/import-tree', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider!.id,
          categoryTree: category
        })
      });

      if (response.ok) {
        const result = await response.json();
        setImportProgress(prev => [...prev, 
          `✅ تم الاستيراد بنجاح!`,
          `📂 الفئات: ${result.imported.categories}`,
          `📦 المنتجات: ${result.imported.products}`
        ]);
        
        // Refresh data
        await fetchData();
        
        setTimeout(() => {
          setShowImportModal(false);
        }, 2000);
      } else {
        const error = await response.json();
        throw new Error(error.error);
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      setImportProgress(prev => [...prev, `❌ خطأ في الاستيراد: ${errorMessage}`]);
    } finally {
      setImportLoading(false);
    }
  };

  // Helper functions
  const toggleCategoryExpansion = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accept': return 'text-green-600 bg-green-100';
      case 'reject': return 'text-red-600 bg-red-100';
      case 'wait': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'automatic': return 'text-blue-600 bg-blue-100';
      case 'manual': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const buildCategoryHierarchy = () => {
    const rootCategories = categories.filter(cat => !cat.parent_id);
    
    const buildTree = (category: Category): Category & { children: (Category & { children: any[] })[] } => {
      const children = categories
        .filter(cat => cat.parent_id === category.id)
        .map(child => buildTree(child));
      
      return { ...category, children };
    };

    return rootCategories.map(cat => buildTree(cat));
  };

  const renderCategoryTree = (categoryHierarchy: (Category & { children: any[] })[]) => {
    return categoryHierarchy.map((category) => (
      <div key={category.id} className="mb-4">
        <Droppable droppableId={`category-${category.id}`}>
          {(provided: any, snapshot: any) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                snapshot.isDraggingOver ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-lg border-b">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => toggleCategoryExpansion(category.id)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <FolderOpen className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold text-gray-900">{category.name_ar}</span>
                    <span className="text-sm text-gray-500">({category.name_en})</span>
                  </div>
                  {!category.is_active && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                      غير نشط
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {products.filter(p => p.category_id === category.id).length} منتج
                  </span>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Category Content */}
              {expandedCategories.has(category.id) && (
                <div className="p-4">
                  {/* Subcategories */}
                  {category.children && category.children.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">الفئات الفرعية:</div>
                      <div className="pl-4 border-r-2 border-gray-200">
                        {renderCategoryTree(category.children)}
                      </div>
                    </div>
                  )}

                  {/* Products */}
                  <div className="space-y-3">
                    {products
                      .filter(product => product.category_id === category.id)
                      .map((product, index) => (
                        <Draggable key={product.id} draggableId={`product-${product.id}`} index={index}>
                          {(provided: any, snapshot: any) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-white p-4 rounded-lg border transition-all duration-200 ${
                                snapshot.isDragging 
                                  ? 'shadow-xl border-blue-300 bg-blue-50' 
                                  : 'shadow-sm border-gray-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                  <Package className="h-5 w-5 text-blue-500" />
                                  <div>
                                    <div className="font-medium text-gray-900">{product.name_ar}</div>
                                    <div className="text-sm text-gray-500">{product.name_en}</div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                  <div className="text-right">
                                    <div className="font-bold text-green-600">${product.price}</div>
                                    {product.base_price && product.base_price !== product.price && (
                                      <div className="text-xs text-gray-500 line-through">
                                        ${product.base_price}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex flex-col space-y-1">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                                      {product.status === 'accept' ? 'مقبول' : 
                                       product.status === 'reject' ? 'مرفوض' : 'في الانتظار'}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(product.product_type)}`}>
                                      {product.product_type === 'automatic' ? 'تلقائي' : 'يدوي'}
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                                    {product.is_active ? (
                                      <Eye className="h-4 w-4 text-green-600" />
                                    ) : (
                                      <EyeOff className="h-4 w-4 text-red-600" />
                                    )}
                                  </div>

                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                                  >
                                    <Edit3 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product)}
                                    className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                  </div>
                </div>
              )}

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    ));
  };

  const categoryHierarchy = buildCategoryHierarchy();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة الكتالوج</h1>
          <p className="text-gray-600 mt-2">إدارة الفئات والمنتجات بسهولة</p>
        </div>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse mt-4 sm:mt-0">
          <button
            onClick={handleStartImport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Upload className="h-4 w-4" />
            <span>استيراد من المزودين</span>
          </button>
          
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowEditCategory(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة فئة</span>
          </button>
          
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowEditProduct(true);
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 rtl:space-x-reverse"
          >
            <Plus className="h-4 w-4" />
            <span>إضافة منتج</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 rtl:left-auto rtl:right-3" />
          <input
            type="text"
            placeholder="البحث في الفئات والمنتجات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rtl:pl-4 rtl:pr-10"
          />
        </div>
      </div>

      {/* Drag and Drop Context */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="space-y-6">
          {/* Categories and Products */}
          {renderCategoryTree(categoryHierarchy)}

          {/* Uncategorized Products */}
          <Droppable droppableId="uncategorized">
            {(provided: any, snapshot: any) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                  snapshot.isDraggingOver ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                }`}
              >
                <div className="p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-t-lg border-b">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <Package className="h-5 w-5 text-orange-500" />
                    <span className="font-semibold text-gray-900">منتجات غير مُصنفة</span>
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      {products.filter(p => !p.category_id).length} منتج
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  {products
                    .filter(product => !product.category_id)
                    .map((product, index) => (
                      <Draggable key={product.id} draggableId={`product-${product.id}`} index={index}>
                        {(provided: any, snapshot: any) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white p-4 rounded-lg border transition-all duration-200 ${
                              snapshot.isDragging 
                                ? 'shadow-xl border-blue-300 bg-blue-50' 
                                : 'shadow-sm border-gray-200 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <Package className="h-5 w-5 text-blue-500" />
                                <div>
                                  <div className="font-medium text-gray-900">{product.name_ar}</div>
                                  <div className="text-sm text-gray-500">{product.name_en}</div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <div className="font-bold text-green-600">${product.price}</div>
                                
                                <div className="flex flex-col space-y-1">
                                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(product.status)}`}>
                                    {product.status === 'accept' ? 'مقبول' : 
                                     product.status === 'reject' ? 'مرفوض' : 'في الانتظار'}
                                  </span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(product.product_type)}`}>
                                    {product.product_type === 'automatic' ? 'تلقائي' : 'يدوي'}
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product)}
                                  className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                </div>

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </div>
      </DragDropContext>

      {/* Edit Category Modal */}
      {showEditCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md m-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
            </h3>
            
            <CategoryForm
              category={editingCategory}
              categories={categories}
              onSave={handleSaveCategory}
              onCancel={() => {
                setShowEditCategory(false);
                setEditingCategory(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl m-4 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </h3>
            
            <ProductForm
              product={editingProduct}
              categories={categories}
              onSave={handleSaveProduct}
              onCancel={() => {
                setShowEditProduct(false);
                setEditingProduct(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportModal
          show={showImportModal}
          step={importStep}
          providers={providers}
          categories={importCategories}
          loading={importLoading}
          progress={importProgress}
          onClose={() => setShowImportModal(false)}
          onProviderSelect={handleProviderSelect}
          onImportCategory={handleImportCategory}
        />
      )}
    </div>
  );
};

// Category Form Component
const CategoryForm: React.FC<{
  category: Category | null;
  categories: Category[];
  onSave: (data: Partial<Category>) => void;
  onCancel: () => void;
}> = ({ category, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name_ar: category?.name_ar || '',
    name_en: category?.name_en || '',
    description: category?.description || '',
    image_url: category?.image_url || '',
    parent_id: category?.parent_id || undefined,
    sort_order: category?.sort_order || 0,
    is_active: category?.is_active !== false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الاسم بالعربية *
        </label>
        <input
          type="text"
          required
          value={formData.name_ar}
          onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الاسم بالإنجليزية *
        </label>
        <input
          type="text"
          required
          value={formData.name_en}
          onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الوصف
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          رابط الصورة
        </label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الفئة الأب
        </label>
        <select
          value={formData.parent_id || ''}
          onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? parseInt(e.target.value) : undefined })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">لا يوجد (فئة رئيسية)</option>
          {categories
            .filter(cat => cat.id !== category?.id)
            .map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.full_path || cat.name_ar}
              </option>
            ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="mr-2 block text-sm text-gray-900">
          نشط
        </label>
      </div>

      <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          حفظ
        </button>
      </div>
    </form>
  );
};

// Product Form Component
const ProductForm: React.FC<{
  product: Product | null;
  categories: Category[];
  onSave: (data: Partial<Product>) => void;
  onCancel: () => void;
}> = ({ product, categories, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name_ar: product?.name_ar || '',
    name_en: product?.name_en || '',
    description: product?.description || '',
    price: product?.price || 0,
    base_price: product?.base_price || 0,
    image_url: product?.image_url || '',
    category_id: product?.category_id || undefined,
    service_type: product?.service_type || 'package',
    product_type: product?.product_type || 'manual',
    status: product?.status || 'accept',
    min_quantity: product?.min_quantity || 1,
    max_quantity: product?.max_quantity || 1000,
    is_active: product?.is_active !== false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم بالعربية *
          </label>
          <input
            type="text"
            required
            value={formData.name_ar}
            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الاسم بالإنجليزية *
          </label>
          <input
            type="text"
            required
            value={formData.name_en}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          الوصف
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            السعر *
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            السعر الأساسي
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الفئة
          </label>
          <select
            value={formData.category_id || ''}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">غير مُصنف</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.full_path || cat.name_ar}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          رابط الصورة
        </label>
        <input
          type="url"
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع الخدمة
          </label>
          <select
            value={formData.service_type}
            onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="package">حزمة</option>
            <option value="custom">مُخصص</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            نوع المنتج
          </label>
          <select
            value={formData.product_type}
            onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="manual">يدوي</option>
            <option value="automatic">تلقائي</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحالة
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="accept">مقبول</option>
            <option value="wait">في الانتظار</option>
            <option value="reject">مرفوض</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحد الأدنى للكمية
          </label>
          <input
            type="number"
            min="1"
            value={formData.min_quantity}
            onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الحد الأقصى للكمية
          </label>
          <input
            type="number"
            min="1"
            value={formData.max_quantity}
            onChange={(e) => setFormData({ ...formData, max_quantity: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active_product"
          checked={formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active_product" className="mr-2 block text-sm text-gray-900">
          نشط
        </label>
      </div>

      <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          إلغاء
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          حفظ
        </button>
      </div>
    </form>
  );
};

// Import Modal Component
const ImportModal: React.FC<{
  show: boolean;
  step: 'provider' | 'categories';
  providers: Provider[];
  categories: ImportCategory[];
  loading: boolean;
  progress: string[];
  onClose: () => void;
  onProviderSelect: (provider: Provider) => void;
  onImportCategory: (category: ImportCategory) => void;
}> = ({ show, step, providers, categories, loading, progress, onClose, onProviderSelect, onImportCategory }) => {
  if (!show) return null;

  const renderCategoryTree = (category: ImportCategory, depth = 0) => {
    const indent = depth * 20;
    
    return (
      <div key={category.id} style={{ marginRight: `${indent}px` }} className="mb-2">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <FolderOpen className="h-4 w-4 text-amber-500" />
            <div>
              <div className="font-medium text-gray-900">{category.name}</div>
              {category.description && (
                <div className="text-sm text-gray-500">{category.description}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            {category.children && category.children.length > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {category.children.length} فئة فرعية
              </span>
            )}
            {category.products && category.products.length > 0 && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                {category.products.length} منتج
              </span>
            )}
            <button
              onClick={() => onImportCategory(category)}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              استيراد
            </button>
          </div>
        </div>
        
        {category.children && category.children.map(child => renderCategoryTree(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl m-4 max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">
            استيراد من المزودين
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {step === 'provider' ? (
            <div className="p-6">
              <h4 className="font-medium mb-4">اختر المزود</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {providers.filter(p => p.is_active).map(provider => (
                  <div
                    key={provider.id}
                    onClick={() => onProviderSelect(provider)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <div className="font-medium text-gray-900">{provider.name}</div>
                    <div className="text-sm text-gray-500 mt-1">{provider.api_url}</div>
                    {provider.last_sync_at && (
                      <div className="text-xs text-gray-400 mt-2">
                        آخر مزامنة: {new Date(provider.last_sync_at).toLocaleDateString('ar')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full">
              {/* Categories Tree */}
              <div className="flex-1 p-6 overflow-y-auto border-l">
                <h4 className="font-medium mb-4">اختر الفئة للاستيراد</h4>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map(category => renderCategoryTree(category))}
                  </div>
                )}
              </div>

              {/* Progress Console */}
              <div className="w-1/3 bg-black text-green-400 p-4">
                <div className="font-mono text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white">سجل العمليات</span>
                    <RefreshCw className="h-4 w-4 text-green-400" />
                  </div>
                  <div className="bg-gray-900 rounded p-3 h-64 overflow-y-auto font-mono text-xs">
                    {progress.map((msg, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {msg}
                      </div>
                    ))}
                    {progress.length === 0 && (
                      <div className="text-gray-600">جاهز للعمل...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CatalogManagement;
