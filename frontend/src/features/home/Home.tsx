import { useNavigate } from "react-router-dom";
import GridBlock from "../../components/GridBlock";
import logo1 from "../../assets/logo1.svg";
import logo2 from "../../assets/logo2.svg";
import logo3 from "../../assets/logo3.svg";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const blocks = [
    { title: "Page 1", logo: logo1, link: "/page1" },
    { title: "Page 2", logo: logo2, link: "/page2" },
    { title: "Page 3", logo: logo3, link: "/page3" },
    { title: "Page 4", logo: logo1, link: "/page4" },
    { title: "Page 5", logo: logo2, link: "/page5" },
    { title: "Page 6", logo: logo3, link: "/page6" },
  ];

  const handleClick = (link: string) => {
    navigate(link);
  };

  return (
    <main
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        padding: "20px",
      }}
    >
      {blocks.map((block, idx) => (
        <GridBlock
          key={idx}
          title={block.title}
          logo={block.logo}
          onClick={() => handleClick(block.link)}
        />
      ))}
    </main>
  );
};

export default Home;
