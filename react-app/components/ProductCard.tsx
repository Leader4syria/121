import { Product } from '@/shared/types';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group hover:scale-105 hover:shadow-2xl aspect-[4/5]">
      {/* Product Image */}
      <div className="relative h-3/4 overflow-hidden">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop'}
          alt={product.name_ar}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Name */}
      <div className="h-1/4 p-3 flex items-center justify-center">
        <h3 className="text-lg font-bold text-white text-center group-hover:text-red-400 transition-colors line-clamp-2" dir="rtl">
          {product.name_ar}
        </h3>
      </div>
    </div>
  );
}
