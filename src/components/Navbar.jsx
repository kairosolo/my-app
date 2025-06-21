import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  return (
    <div>
      <header className="header">
        Welcome to LMAOShop
      </header>
      <nav className="navigation">
        <Link 
          to="/" 
          className={`nav-button ${location.pathname === '/' ? 'active' : ''}`}
        >
          Home
        </Link>
        <Link 
          to="/products" 
          className={`nav-button ${location.pathname === '/products' ? 'active' : ''}`}
        >
          Products
        </Link>
        {/* <Link 
          to="#" 
          className="nav-button"
        >
          Cart
        </Link> */}
      </nav>
    </div>
  );
};

export default Navbar;
