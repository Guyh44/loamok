import React from "react";
import { Link } from "react-router-dom";

interface GridBlockProps {
  title: string;
  link: string;
}

const GridBlock: React.FC<GridBlockProps> = ({ title, link }) => {
  return (
    <Link to={link} style={{ textDecoration: "none" }}>
      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "40px",
          textAlign: "center",
          background: "#f9f9f9",
          cursor: "pointer",
        }}
      >
        {title}
      </div>
    </Link>
  );
};

export default GridBlock;
