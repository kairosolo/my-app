const ProductDetail = ({ product }) => {
  if (!product) {
    return <div className="product-not-found">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="product-detail-image">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="detail-image"
        />
      </div>
      <div className="product-detail-info">
        <h1 className="detail-title">{product.name}</h1>
        <p className="detail-price">₱{product.price}</p>
        <p className="detail-description">{product.description}</p>
        <button className="add-to-cart-btn" disabled>Out of Stock</button>
      </div>
    </div>
  );
};

export default ProductDetail;
