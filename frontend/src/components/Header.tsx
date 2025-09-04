import { Link } from "react-router-dom";
import "./Header.css"; // contains your header CSS

const Header: React.FC = () => {

  return (
    <header>
      <h1>
        <Link to={"/"}>...זה לא כזה עמוק</Link>
      </h1>
    </header>
  );
};

export default Header;
