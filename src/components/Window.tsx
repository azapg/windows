import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Square } from 'lucide-react';

interface WindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  initialWidth?: number;
  initialHeight?: number;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onFocus: () => void;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
}

const Window: React.FC<WindowProps> = ({
  id,
  title,
  children,
  initialX = 100,
  initialY = 100,
  initialWidth = 400,
  initialHeight = 300,
  onMinimize,
  onMaximize,
  onClose,
  onFocus,
  zIndex,
  isMinimized,
  isMaximized,
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [size, setSize] = useState({ width: initialWidth, height: initialHeight });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string>('');
  const [resizeDragStart, setResizeDragStart] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    onFocus();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleResizeMouseDown = (direction: string) => (e: React.MouseEvent) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    onFocus();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      let newX = e.clientX - dragStart.x;
      let newY = e.clientY - dragStart.y;
      // Clamp to viewport
      const maxX = window.innerWidth - size.width;
      const maxY = window.innerHeight - size.height;
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
    } else if (isResizing) {
      let newX = position.x;
      let newY = position.y;
      let newWidth = size.width;
      let newHeight = size.height;
      const deltaX = e.clientX - resizeDragStart.x;
      const deltaY = e.clientY - resizeDragStart.y;

      if (resizeDirection.includes('left')) {
        newWidth = Math.max(200, size.width - deltaX);
        newX = position.x + deltaX;
      } else if (resizeDirection.includes('right')) {
        newWidth = Math.max(200, size.width + deltaX);
      }

      if (resizeDirection.includes('top')) {
        newHeight = Math.max(150, size.height - deltaY);
        newY = position.y + deltaY;
      } else if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(150, size.height + deltaY);
      }

      // Clamp position
      newX = Math.max(0, Math.min(newX, window.innerWidth - newWidth));
      newY = Math.max(0, Math.min(newY, window.innerHeight - newHeight));

      setPosition({ x: newX, y: newY });
      setSize({ width: newWidth, height: newHeight });
      setResizeDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  if (isMinimized) return null;

  const windowStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    zIndex: zIndex,
    userSelect: isResizing ? 'none' : 'auto',
    ...(isMaximized
      ? {
          left: 0,
          top: 0,
          width: '100vw',
          height: '100vh',
        }
      : {
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
        }),
  };

  return (
    <div
      ref={windowRef}
      style={windowStyle}
    >
      <div
        className="flex items-center justify-between bg-gray-100 px-3 py-2 cursor-move select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
          >
            <X size={8} className="text-white" />
          </button>
          <button
            onClick={onMinimize}
            className="w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center hover:bg-yellow-600"
          >
            <Minus size={8} className="text-white" />
          </button>
          <button
            onClick={onMaximize}
            className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600"
          >
            <Square size={8} className="text-white" />
          </button>
        </div>
        <span className="text-sm font-medium">{title}</span>
        <div></div> {/* Spacer */}
      </div>
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
      {/* Resize Handles */}
      <div
        className="absolute top-0 left-0 w-full h-2 cursor-n-resize"
        onMouseDown={handleResizeMouseDown('top')}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize"
        onMouseDown={handleResizeMouseDown('bottom')}
      ></div>
      <div
        className="absolute top-0 left-0 w-2 h-full cursor-w-resize"
        onMouseDown={handleResizeMouseDown('left')}
      ></div>
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-e-resize"
        onMouseDown={handleResizeMouseDown('right')}
      ></div>
      <div
        className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
        onMouseDown={handleResizeMouseDown('top-left')}
      ></div>
      <div
        className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
        onMouseDown={handleResizeMouseDown('top-right')}
      ></div>
      <div
        className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
        onMouseDown={handleResizeMouseDown('bottom-left')}
      ></div>
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        onMouseDown={handleResizeMouseDown('bottom-right')}
      ></div>
    </div>
  );
};

export default Window;