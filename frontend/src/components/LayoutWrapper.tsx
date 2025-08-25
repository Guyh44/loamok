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
        opacity={0.1}
        speed={25}
      />
      
      {/* All your page content */}
      {children}
    </div>
  );
};

export default LayoutWrapper;