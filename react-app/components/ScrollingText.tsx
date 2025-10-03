import { useEffect, useRef } from 'react';

interface ScrollingTextProps {
  text: string;
  speed?: number;
}

export default function ScrollingText({ text, speed = 50 }: ScrollingTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !text) return;

    // Create continuous scrolling animation with CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes infiniteScroll {
        0% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(-100%);
        }
      }
      .infinite-scroll {
        animation: infiniteScroll ${Math.max(text.length / 5, 10)}s linear infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, [text, speed]);

  if (!text) return null;

  return (
    <div 
      ref={containerRef}
      className="overflow-hidden whitespace-nowrap relative w-full"
    >
      <div 
        className="inline-block infinite-scroll"
        dir="rtl"
      >
        {text}
      </div>
    </div>
  );
}
