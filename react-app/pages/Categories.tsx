import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Category, Product } from '@/shared/types';
import Layout from '@/react-app/components/Layout';
import CategoryCard from '@/react-app/components/CategoryCard';
import ProductCard from '@/react-app/components/ProductCard';
import { Grid, List, Filter } from 'lucide-react';

export default function Categories() {
  const { id } = useParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Always fetch categories
        const categoriesResponse = await fetch('/api/public/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
          
          if (id) {
            // Find the selected category
            const category = categoriesData.find((cat: Category) => cat.id === parseInt(id));
            setSelectedCategory(category || null);
            
            // Fetch products for this category
            const productsResponse = await fetch(`/api/public/categories/${id}/products`);
            if (productsResponse.ok) {
              const productsData = await productsResponse.json();
              setProducts(productsData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        </div>
      </Layout>
    );
  }

  // Show all categories if no specific category is selected
  if (!id || !selectedCategory) {
    return (
      <Layout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4" dir="rtl">
              فئات الخدمات
            </h1>
            <p className="text-gray-400 text-lg" dir="rtl">
              اكتشف جميع الخدمات المتاحة في منصة سوق حلب
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Show products for selected category
  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div dir="rtl">
              <h1 className="text-4xl font-bold text-white mb-2">
                {selectedCategory.name_ar}
              </h1>
              <p className="text-gray-400 text-lg">
                {selectedCategory.description || selectedCategory.name_en}
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="flex items-center space-x-2 space-x-reverse bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span dir="rtl">تصفية</span>
            </button>
            
            <select className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" dir="rtl">
              <option>ترتيب حسب</option>
              <option>الأحدث</option>
              <option>الأقل سعراً</option>
              <option>الأعلى سعراً</option>
              <option>الأكثر طلباً</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {products.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2" dir="rtl">
              لا توجد خدمات متاحة
            </h3>
            <p className="text-gray-400" dir="rtl">
              لم يتم العثور على خدمات في هذه الفئة حالياً
            </p>
          </div>
        )}

        {/* Back to Categories */}
        <div className="mt-12 text-center">
          <a
            href="/categories"
            className="inline-flex items-center space-x-2 space-x-reverse bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            dir="rtl"
          >
            <span>عرض جميع الفئات</span>
          </a>
        </div>
      </div>
    </Layout>
  );
}
