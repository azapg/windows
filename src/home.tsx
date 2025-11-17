import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Window from "@/components/Window";

interface WindowState {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minimized: boolean;
  maximized: boolean;
  zIndex: number;
  content: React.ReactNode;
}

function Home() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [nextId, setNextId] = useState(1);
  const [maxZIndex, setMaxZIndex] = useState(1);

  const createWindow = () => {
    const newZIndex = maxZIndex + 1;
    const newWindow: WindowState = {
      id: `window-${nextId}`,
      title: `Window ${nextId}`,
      x: 100 + (nextId - 1) * 50,
      y: 100 + (nextId - 1) * 50,
      width: 400,
      height: 300,
      minimized: false,
      maximized: false,
      zIndex: newZIndex,
      content: <div className="p-4">This is the content of Window {nextId}</div>,
    };
    setWindows([...windows, newWindow]);
    setNextId(nextId + 1);
    setMaxZIndex(newZIndex);
  };

  const minimizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: true } : w));
  };

  const maximizeWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, maximized: !w.maximized } : w));
  };

  const closeWindow = (id: string) => {
    setWindows(windows.filter(w => w.id !== id));
  };

  const focusWindow = (id: string) => {
    const newZIndex = maxZIndex + 1;
    setWindows(windows.map(w => w.id === id ? { ...w, zIndex: newZIndex } : w));
    setMaxZIndex(newZIndex);
  };

  const reopenWindow = (id: string) => {
    setWindows(windows.map(w => w.id === id ? { ...w, minimized: false } : w));
  };

  const minimizedWindows = windows.filter(w => w.minimized);

  return (
    <div className="min-h-svh bg-gray-50 relative">
      <div className="p-4">
        <Button onClick={createWindow}>Create New Window</Button>
        {minimizedWindows.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Minimized Windows:</h3>
            <div className="flex space-x-2 mt-2">
              {minimizedWindows.map(w => (
                <Button key={w.id} onClick={() => reopenWindow(w.id)}>
                  Reopen {w.title}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
      {windows.map(w => (
        <Window
          key={w.id}
          id={w.id}
          title={w.title}
          initialX={w.x}
          initialY={w.y}
          initialWidth={w.width}
          initialHeight={w.height}
          onMinimize={() => minimizeWindow(w.id)}
          onMaximize={() => maximizeWindow(w.id)}
          onClose={() => closeWindow(w.id)}
          onFocus={() => focusWindow(w.id)}
          zIndex={w.zIndex}
          isMinimized={w.minimized}
          isMaximized={w.maximized}
        >
          {w.content}
        </Window>
      ))}
    </div>
  );
}

export default Home;