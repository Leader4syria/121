import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import HeroBanner from '@/react-app/components/HeroBanner';
import AnnouncementBar from '@/react-app/components/AnnouncementBar';
import CategoryCard from '@/react-app/components/CategoryCard';
import { HomeData } from '@/shared/types';

export default function Home() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Announcement Bar */}
        {homeData?.announcement && (
          <AnnouncementBar text={homeData.announcement} />
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
          {/* Hero Banner */}
          {homeData?.banners && homeData.banners.length > 0 && (
            <HeroBanner banners={homeData.banners} />
          )}

          

          {/* Categories Section */}
          {homeData?.categories && homeData.categories.length > 0 && (
            <section>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {homeData.categories.map((category) => (
                  <CategoryCard key={category.id} category={category} />
                ))}
              </div>
            </section>
          )}

          
        </div>
      </div>
    </Layout>
  );
}
