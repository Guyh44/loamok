import "./GenericPage.css";

interface GenericPageProps {
  title?: string;
  children?: React.ReactNode;
}

const GenericPage: React.FC<GenericPageProps> = ({ title, children }) => {
  return (
    <div className="generic-page">
      <h2 className="generic-page-content">{title}</h2>
      <div className="generic-page-content">{children}</div>
    </div>
  );
};

export default GenericPage;
