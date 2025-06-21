import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <img 
        src={product.imageUrl} 
        alt={product.name}
        className="product-image"
      />
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">₱{product.price}</p>
        <p className="product-description">{product.description}</p>
        <Link 
          to={`/product/${product.id}`}
          className="view-details-btn"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
