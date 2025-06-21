import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="content">
      <h1 className="content-title">Welcome to LMAOShop</h1>
      <p className="content-text">
        Discover our funny collection of products! We have everything you don't need! Buy it to support our families!
      </p>
      <div className="home-navigation">
        <Link to="/products" className="home-link-btn">
          Browse Products
        </Link>
      </div>
    </main>
  );
};

export default Home;
