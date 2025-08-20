import { useNavigate } from "react-router-dom";
import "./Home.css";
import GridBlock from "../../components/GridBlock";
import siv_icon from "../../assets/siv.png";
import users_icon from "../../assets/users.svg";
import king_icon from "../../assets/king.svg"
import logo3 from "../../assets/logo3.svg";

const Home: React.FC = () => {
  const navigate = useNavigate();

  const blocks = [
    { title: "הוספת אדמין לעמדה", logo: king_icon, link: "/add-admin" },
    { title: "ניהול משתמשים", logo: users_icon, link: "/manage-users" },
    { title: "קנפוג פורטים", logo: siv_icon, link: "/change-vlan" },
    { title: "ניהול מכונות", logo: logo3, link: "/manage-vms" },
    { title: "AD הוספה לקבוצת", logo: logo3, link: "/groups" },
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
