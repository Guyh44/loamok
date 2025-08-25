import React, { useEffect, useState } from 'react';
import './AnimatedBackground.css';

interface AnimatedBackgroundProps {
  imagePath: string;
  opacity?: number;
  speed?: number;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  imagePath, 
  opacity = 0.08, 
  speed = 10 
}) => {
  const [columns, setColumns] = useState<Array<{
    id: number;
    x: number;
    isOdd: boolean;
    imageCount: number;
  }>>([]);

  useEffect(() => {
    const columnWidth = 120; // must match CSS .column width
    const numColumns = Math.ceil(window.innerWidth / columnWidth) + 2;

    const newColumns = Array.from({ length: numColumns }, (_, index) => ({
      id: index,
      x: index * columnWidth,
      isOdd: index % 2 === 1,
      imageCount: Math.ceil(window.innerHeight / 100) + 4,
    }));

    setColumns(newColumns);

    const handleResize = () => {
      const newNumColumns = Math.ceil(window.innerWidth / columnWidth) + 2;
      const resizedColumns = Array.from({ length: newNumColumns }, (_, index) => ({
        id: index,
        x: index * columnWidth,
        isOdd: index % 2 === 1,
        imageCount: Math.ceil(window.innerHeight / 100) + 4,
      }));
      setColumns(resizedColumns);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="animated-background">
      {columns.map((column) => (
        <div
          key={column.id}
          className={`column ${column.isOdd ? 'move-up' : 'move-down'}`}
          style={{
            left: `${column.x}px`,
            animationDuration: `${speed}s`,
          }}
        >
          {Array.from({ length: column.imageCount * 2 }, (_, imgIndex) => (
            <img
              key={imgIndex}
              src={imagePath}
              alt=""
              className="background-image"
              style={{ opacity }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default AnimatedBackground;
