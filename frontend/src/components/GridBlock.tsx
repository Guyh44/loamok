interface GridBlockProps {
  title: string;
  logo: string;
  onClick: () => void;
  isComingSoon?: boolean;
}

const GridBlock: React.FC<GridBlockProps> = ({ title, logo, onClick, isComingSoon = false }) => {
  return (
    <div 
      className={`grid-block ${isComingSoon ? 'coming-soon' : ''}`} 
      onClick={onClick}
    >
      {!isComingSoon && logo && (
        <img src={logo} alt={title} className="grid-logo" />
      )}
      <h2>{title}</h2>
    </div>
  );
};

export default GridBlock;