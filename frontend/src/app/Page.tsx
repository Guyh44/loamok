interface PageProps {
  title: string;
}

const Page: React.FC<PageProps> = ({ title }) => {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>{title}</h1>
      <p>This is {title} content.</p>
    </div>
  );
};

export default Page;
