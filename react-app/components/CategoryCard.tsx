import { Link } from 'react-router';
import { Category } from '@/shared/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link 
      to={`/categories/${category.id}`}
      className="group block bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/10"
    >
      <div className="aspect-square relative overflow-hidden rounded-xl mb-3">
        {category.image_url ? (
          <img
            src={category.image_url}
            alt={category.name_ar}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`absolute inset-0 bg-gradient-to-br from-red-600/80 to-red-500/80 flex items-center justify-center ${category.image_url ? 'hidden' : ''}`}>
          <span className="text-white text-2xl font-bold">
            {category.name_ar.charAt(0)}
          </span>
        </div>
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="text-center">
        <h3 className="text-white font-semibold text-sm leading-tight group-hover:text-red-400 transition-colors duration-300" dir="rtl">
          {category.name_ar}
        </h3>
      </div>
    </Link>
  );
}
