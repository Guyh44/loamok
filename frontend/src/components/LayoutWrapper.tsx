import React from 'react';
import AnimatedBackground from './AnimatedBackground';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  return (
    <div className="layout-wrapper">
      {/* Global animated background */}
      <AnimatedBackground 
        imagePath="/assets/mask.png" // Replace with your actual mask image path
        opacity={0.09}
        speed={0.8}
      />
      
      {/* All your page content */}
      {children}
    </div>
  );
};

export default LayoutWrapper;