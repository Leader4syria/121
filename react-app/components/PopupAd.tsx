import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface PopupAd {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  button_text?: string;
  button_url?: string;
  button_color: string;
  popup_width: number;
  popup_height: number;
  image_width: number;
  image_height: number;
  button_position: string;
  background_color: string;
  text_color: string;
  border_radius: number;
  show_on_pages: string;
  show_once_per_session: boolean;
  delay_seconds: number;
}

interface PopupAdProps {
  currentPath: string;
}

export default function PopupAd({ currentPath }: PopupAdProps) {
  const [popups, setPopups] = useState<PopupAd[]>([]);
  const [activePopup, setActivePopup] = useState<PopupAd | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchPopups = async () => {
      try {
        const response = await fetch('/api/public/popups');
        if (response.ok) {
          const data = await response.json();
          setPopups(data);
        }
      } catch (error) {
        console.error('Error fetching popups:', error);
      }
    };

    fetchPopups();

    // Listen for popup session reset events
    const handlePopupReset = (event: CustomEvent) => {
      const { popupId } = event.detail;
      const sessionKey = `popup_shown_${popupId}`;
      sessionStorage.removeItem(sessionKey);
      
      // Refetch popups to trigger showing the reset popup
      fetchPopups();
    };

    window.addEventListener('popupSessionReset', handlePopupReset as EventListener);

    return () => {
      window.removeEventListener('popupSessionReset', handlePopupReset as EventListener);
    };
  }, []);

  useEffect(() => {
    if (popups.length === 0) return;

    // Find popup that should show on current page
    const validPopup = popups.find(popup => {
      if (popup.show_on_pages === 'all') return true;
      
      const pages = popup.show_on_pages.split(',').map(p => p.trim());
      return pages.some(page => currentPath.startsWith(page));
    });

    if (!validPopup) return;

    // Check if popup was already shown in this session
    const sessionKey = `popup_shown_${validPopup.id}`;
    if (validPopup.show_once_per_session && sessionStorage.getItem(sessionKey)) {
      return;
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setActivePopup(validPopup);
      setIsVisible(true);
      
      if (validPopup.show_once_per_session) {
        sessionStorage.setItem(sessionKey, 'true');
      }
    }, validPopup.delay_seconds * 1000);

    return () => clearTimeout(timer);
  }, [popups, currentPath]);

  const closePopup = () => {
    setIsVisible(false);
    setTimeout(() => setActivePopup(null), 300);
  };

  const handleButtonClick = () => {
    if (activePopup?.button_url) {
      window.open(activePopup.button_url, '_blank');
    }
    closePopup();
  };

  if (!activePopup) return null;

  const buttonPositionClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[activePopup.button_position] || 'justify-center';

  return (
    <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div 
        className={`relative transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{
          width: `${activePopup.popup_width}px`,
          maxWidth: '90vw',
          height: `${activePopup.popup_height}px`,
          maxHeight: '90vh',
          backgroundColor: activePopup.background_color,
          color: activePopup.text_color,
          borderRadius: `${activePopup.border_radius}px`
        }}
      >
        {/* Close Button */}
        <button
          onClick={closePopup}
          className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="p-6 h-full flex flex-col">
          {/* Title */}
          {activePopup.title && (
            <h2 className="text-xl font-bold mb-4 text-center" dir="rtl">
              {activePopup.title}
            </h2>
          )}

          {/* Image */}
          {activePopup.image_url && (
            <div className="flex justify-center mb-4">
              <img
                src={activePopup.image_url}
                alt={activePopup.title || 'إعلان'}
                className="rounded-lg object-cover shadow-md"
                style={{
                  width: `${activePopup.image_width}px`,
                  height: `${activePopup.image_height}px`,
                  maxWidth: '100%',
                  maxHeight: '40%'
                }}
              />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center leading-relaxed" dir="rtl">
              {activePopup.content}
            </p>
          </div>

          {/* Button */}
          {activePopup.button_text && (
            <div className={`flex ${buttonPositionClass} mt-4`}>
              <button
                onClick={handleButtonClick}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 shadow-lg"
                style={{ backgroundColor: activePopup.button_color }}
              >
                {activePopup.button_text}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
