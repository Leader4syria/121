import ScrollingText from './ScrollingText';
import { Megaphone } from 'lucide-react';

interface AnnouncementBarProps {
  text: string;
}

export default function AnnouncementBar({ text }: AnnouncementBarProps) {
  if (!text) return null;

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-3 overflow-hidden shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="flex-shrink-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <Megaphone className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex-1 text-white font-medium">
            <ScrollingText text={text} speed={80} />
          </div>
        </div>
      </div>
    </div>
  );
}
