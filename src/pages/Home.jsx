import { Link } from 'react-router-dom';
import { onSnapshot, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import './Home.css';

export default function Home({ user }) {
  const [articles, setArticles] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, 'articles');
    const unsubscribe = onSnapshot(ref, (snapshot) => {
      let results = [];
      snapshot.docs.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      setArticles(results);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    const ref = doc(db, 'articles', id);
    await deleteDoc(ref);
  };

  return (
    <div className="home">
      <h2>Articles</h2>
      {isLoading && <p>Loading articles...</p>}
      {articles && articles.map((article) => (
        <div key={article.id} className="card">
          <h3>{article.title}</h3>
          <p>Written by {article.author}</p>
          <Link to={`/articles/${article.id}`}>Read More...</Link>
          
          {/* Show delete icon ONLY if user is logged in AND owns the article */}
          {user && user.id === article.createdBy && (
            <FontAwesomeIcon
              icon={faTrashAlt}
              className="icon"
              onClick={() => handleDelete(article.id)}
            />
          )}
        </div>
      ))}
    </div>
  );
}