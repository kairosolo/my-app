import { useState } from 'react';
import ProductCard from '../components/ProductCard';

const ProductList = () => {
  const [products] = useState([
  {
      id: 1,
      name: "Pet Rock",
      price: 749,
      description: "The best pet you have ever seen!",
      imageUrl: "https://www.offthewagonshop.com/cdn/shop/products/super-impulse-toy-novelties-the-original-pet-rock-funny-gag-gifts-35697629069473.jpg?v=1666446203&width=1080"
    },
    {
      id: 2,
      name: "Instant Underpants",
      price: 199,
      description: "You know those times when you're not at your home and you need to change your underpants? We got you covered.",
      imageUrl: "https://www.offthewagonshop.com/cdn/shop/products/accoutrements-archie-mcphee-home-personal-instant-underpants-funny-gag-gifts-30379077140641.jpg?v=1628389361&width=1800"
    },
    {
      id: 3,
      name: "Shut The Hell Up Gum",
      price: 119,
      description: "Do you have a friend that talks so much you want him/her to shut up but don't want to hurt their feelings? This is for you!",
      imageUrl: "https://www.offthewagonshop.com/cdn/shop/products/blue-q-candy-shut-the-hell-up-gum-funny-gag-gifts-17296149807265.jpg?v=1699195567&width=1800"
    },
    {
      id: 4,
      name: "Disappointed Sigh",
      price: 249,
      description: "Do you want to express your disappointment easily? Buy us now!",
      imageUrl: "https://www.offthewagonshop.com/cdn/shop/products/accoutrements-archie-mcphee-impulse-im-funny-stuff-disappointed-sigh-funny-gag-gifts-17289520414881.png?v=1628380200&width=1080"
    },
    {
      id: 5,
      name: "Candy cigarettes - 1 pack",
      price: 55,
      description: "Is your personality too boring? elevate it by buying us so you now have a new smoking personality!",
      imageUrl: "https://www.offthewagonshop.com/cdn/shop/products/redstone-foods-candy-candy-cigarettes-1-pack-funny-gag-gifts-32059405205665.png?v=1636756477&width=1800"
    },
    {
      id: 6,
      name: "How to talk to your cat about gun safety Book",
      price: 349,
      description: "Don't know how to bring up gun safety to your cat? This book is for you!",
      imageUrl: "https://www.offthewagonshop.com/cdn/shop/products/random-house-books-how-to-talk-to-your-cat-about-gun-safety-book-funny-gag-gifts-17273580421281.jpg?v=1628348684&width=1800"
    }
  ]);
  
  return (
    <main className="content">
      <h1 className="content-title">Our Products</h1>
      <div className="products-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
};

export default ProductList;
