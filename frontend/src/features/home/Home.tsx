import React from "react";
import GridBlock from "../../components/GridBlock";

const Home: React.FC = () => {
  const blocks = [
    { title: "Page 1", link: "/page1" },
    { title: "Page 2", link: "/page2" },
    { title: "Page 3", link: "/page3" },
    { title: "Page 4", link: "/page4" },
    { title: "Page 5", link: "/page5" },
    { title: "Page 6", link: "/page6" },
  ];

  return (
    <main style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", padding: "20px" }}>
      {blocks.map((block, idx) => (
        <GridBlock key={idx} title={block.title} link={block.link} />
      ))}
    </main>
  );
};

export default Home;
