import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: string;
}

const Tooltip: React.FC<TooltipProps> = ({ content }) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [tooltipStyles, setTooltipStyles] = useState<React.CSSProperties>({});
  const [arrowStyles, setArrowStyles] = useState<React.CSSProperties>({});
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');

  useLayoutEffect(() => {
    if (isVisible && triggerRef.current) {
      const updatePosition = () => {
        const triggerRect = triggerRef.current!.getBoundingClientRect();
        const tooltipWidth = 256; // w-64 is 16rem = 256px
        const padding = 10; // Screen edge padding

        // Horizontal Calculation
        let left = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
        
        // Clamp to screen edges
        if (left < padding) left = padding;
        if (left + tooltipWidth > window.innerWidth - padding) {
          left = window.innerWidth - tooltipWidth - padding;
        }

        // Arrow Calculation (relative to tooltip)
        // Center of trigger relative to the screen
        const triggerCenter = triggerRect.left + triggerRect.width / 2;
        // Position of arrow relative to tooltip left edge
        let arrowLeft = triggerCenter - left;
        // Clamp arrow so it doesn't detach from corners
        if (arrowLeft < 10) arrowLeft = 10;
        if (arrowLeft > tooltipWidth - 10) arrowLeft = tooltipWidth - 10;

        // Vertical Calculation
        const spaceAbove = triggerRect.top;
        // Default to top, flip if not enough space (less than ~120px)
        let top: number;
        let newPlacement: 'top' | 'bottom' = 'top';

        if (spaceAbove < 120) {
           // Place bottom
           newPlacement = 'bottom';
           top = triggerRect.bottom + 10;
        } else {
           // Place top
           newPlacement = 'top';
           top = triggerRect.top - 10;
        }

        setPlacement(newPlacement);
        setTooltipStyles({
          position: 'fixed',
          left: `${left}px`,
          top: `${top}px`,
          zIndex: 9999,
          // If top, we translate Y -100% to sit above. If bottom, we just sit there.
          transform: newPlacement === 'top' ? 'translateY(-100%)' : 'none',
        });
        
        setArrowStyles({
            left: `${arrowLeft}px`
        });
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true); // Capture scroll

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isVisible]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="w-3.5 h-3.5 ml-1.5 align-middle rounded-full border border-gray-600 text-[9px] inline-flex items-center justify-center text-gray-400 hover:text-white hover:border-white transition-colors focus:outline-none"
        aria-label="More information"
      >
        i
      </button>
      {isVisible && createPortal(
        <div 
            className="w-64 p-3 bg-gray-100 text-black text-xs rounded shadow-xl border border-gray-300 pointer-events-none"
            style={tooltipStyles}
        >
          {content}
          {/* Arrow */}
          <div 
            className={`absolute w-0 h-0 border-4 border-transparent ${
                placement === 'top' 
                ? 'border-t-gray-100 top-full' 
                : 'border-b-gray-100 bottom-full'
            }`}
            style={{ 
                left: arrowStyles.left, 
                transform: 'translateX(-50%)',
                // Use margin to pull it slightly over the border for seamless look
                marginTop: placement === 'bottom' ? '-9px' : '0', 
            }}
          ></div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;