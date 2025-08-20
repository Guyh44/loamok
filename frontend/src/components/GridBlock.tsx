interface GridBlockProps {
  title: string;
  logo: string;
  onClick: () => void;
}

const GridBlock: React.FC<GridBlockProps> = ({ title, logo, onClick }) => {
  return (
    <div className="grid-block" onClick={onClick}>
      <img src={logo} alt={title} className="grid-logo" />
      <h2>{title}</h2>
    </div>
  );
};

export default GridBlock;
