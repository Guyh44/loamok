import "./GenericPage.css";

interface GenericPageProps {
  title?: string;
  children?: React.ReactNode;
  containerClassName?: string; // Add this prop
}

const GenericPage: React.FC<GenericPageProps> = ({ children, containerClassName }) => {
  return (
    <div className="generic-page">
      <div id="generic-container" className={containerClassName}>
        {children}
      </div>
    </div>
  );
};

export default GenericPage;