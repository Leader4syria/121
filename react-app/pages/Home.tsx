import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import HeroBanner from '@/react-app/components/HeroBanner';
import AnnouncementBar from '@/react-app/components/AnnouncementBar';
import CategoryCard from '@/react-app/components/CategoryCard';
import { HomeData, Category } from '@/shared/types';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const response = await fetch('/api/public/home');
        if (response.ok) {
          const data = await response.json();
          setHomeData(data);
        }
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const buildCategoryHierarchy = (categories: Category[]) => {
    const rootCategories = categories.filter(cat => !cat.parent_id && cat.is_active);

    const buildTree = (category: Category): Category & { children: any[] } => {
      const children = categories
        .filter(cat => cat.parent_id === category.id && cat.is_active)
        .map(child => buildTree(child));

      return { ...category, children };
    };

    return rootCategories.map(cat => buildTree(cat));
  };

  const toggleCategory = (categoryId: number) => {
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

  const renderCategoryWithChildren = (category: Category & { children: any[] }) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);

    return (
      <div key={category.id} className="w-full">
        <div className="relative">
          <CategoryCard category={category} />

          {hasChildren && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="absolute bottom-2 left-2 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-1.5 transition-all duration-200 z-10"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-4 pr-4 border-r-2 border-red-500/30 space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.children.map((child: Category & { children: any[] }) => (
                <div key={child.id} className="transform scale-95">
                  {renderCategoryWithChildren(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

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

  const categoryHierarchy = homeData?.categories ? buildCategoryHierarchy(homeData.categories) : [];

  return (
    <Layout>
      <div className="min-h-screen">
        {homeData?.announcement && (
          <AnnouncementBar text={homeData.announcement} />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {homeData?.banners && homeData.banners.length > 0 && (
            <HeroBanner banners={homeData.banners} />
          )}

          {categoryHierarchy.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-6" dir="rtl">التصنيفات</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {categoryHierarchy.map((category) => renderCategoryWithChildren(category))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
}
