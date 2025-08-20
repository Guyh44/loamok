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
    { title: "קנפוג פורטים", logo: siv_icon, link: "/change-vlan", active: true },
    { title: "ניהול משתמשים", logo: users_icon, link: "/manage-users", active: true },
    { title: "הוספת אדמין לעמדה", logo: king_icon, link: "/add-admin", active: true },
    { title: "ניהול מכונות", logo: logo3, link: "/manage-vms", active: true },
    { title: "AD הוספה לקבוצת", logo: logo3, link: "/groups", active: true },
    { title: "יצירת משתמש", logo: logo3, link: "/create-user", active: true },
  ];

  // Add "Coming Soon" blocks to fill the grid
  const comingSoonBlocks = [
    { title: "Coming soon...", logo: "", link: "", active: false },
    { title: "Coming soon...", logo: "", link: "", active: false },
    { title: "Coming soon...", logo: "", link: "", active: false },
    { title: "Coming soon...", logo: "", link: "", active: false },
    { title: "Coming soon...", logo: "", link: "", active: false },
    { title: "Coming soon...", logo: "", link: "", active: false },
  ];

  const allBlocks = [...blocks, ...comingSoonBlocks];

  const handleClick = (link: string, active: boolean) => {
    if (active && link) {
      navigate(link);
    }
  };

  return (
    <main className="home-main">
      {allBlocks.map((block, idx) => (
        <GridBlock
          key={idx}
          title={block.title}
          logo={block.logo}
          onClick={() => handleClick(block.link, block.active)}
          isComingSoon={!block.active}
        />
      ))}
    </main>
  );
};

export default Home;