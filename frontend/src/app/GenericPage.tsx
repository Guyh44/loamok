import "./GenericPage.css";
import { useState } from "react";

interface GenericPageProps {
  title?: string;
  children?: React.ReactNode;
}

const GenericPage: React.FC<GenericPageProps> = ({ children }) => {


  return (
    <div className="generic-page">
      <div id="generic-container">
        {children}
      </div>
    </div>
  );
};

export default GenericPage;
