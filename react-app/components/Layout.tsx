import { ReactNode } from 'react';
import Header from './Header';
import LoadingScreen from './LoadingScreen';
import { usePageTransition } from '@/react-app/hooks/usePageTransition';

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
}

export default function Layout({ 
  children, 
  showHeader = true
}: LayoutProps) {
  const { showLoadingScreen } = usePageTransition();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {showHeader && <Header />}
      
      <main className={showHeader ? 'pt-16' : ''}>
        {children}
      </main>

      <LoadingScreen isVisible={showLoadingScreen} />
    </div>
  );
}
