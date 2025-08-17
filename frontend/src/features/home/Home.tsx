import { useNavigate } from "react-router-dom";
import "./Home.css";
import GridBlock from "../../components/GridBlock";
import logo1 from "../../assets/logo1.svg";
import logo2 from "../../assets/logo2.svg";
import logo3 from "../../assets/logo3.svg";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const blocks = [
    { title: "הוספת אדמין לעמדה", logo: logo1, link: "/add-admin" },
    { title: "ניהול משתמשים", logo: logo2, link: "/manage-users" },
    { title: "קנפוג פורטים", logo: logo3, link: "/change-vlan" },
    { title: "ניהול מכונות", logo: logo1, link: "/manage-vms" },
    { title: "AD הוספה לקבוצת", logo: logo2, link: "/groups" },
    { title: "יצירת משתמש", logo: logo3, link: "/create-user" },
  ];

  const handleClick = (link: string) => {
    navigate(link);
  };

  return (
    <main className="home-main">
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
