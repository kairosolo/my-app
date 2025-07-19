import { useNavigate, useParams } from 'react-router-dom';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useEffect, useState } from 'react';

export default function Article({ user }) {
  const { urlId } = useParams();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const ref = doc(db, 'articles', urlId);
    getDoc(ref)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          setArticle({ id: snapshot.id, ...data });
          setTitle(data.title);
          setAuthor(data.author);
          setDescription(data.description);
        } else {
          setError('Article not found!');
        }
        setIsLoading(false);
      })
      .catch(err => {
        setError('Could not fetch article data.');
        setIsLoading(false);
      });
  }, [urlId]);

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const ref = doc(db, 'articles', urlId);
    try {
      await updateDoc(ref, { title, author, description });
      setArticle({ ...article, title, author, description });
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating document: ", err);
      alert("Failed to update article.");
    }
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {article && !isEditing && (
        <div>
          <h2>{article.title}</h2>
          <p>By {article.author}</p>
          <p>{article.description}</p>
          {/* Show update button ONLY if user is logged in AND owns the article */}
          {user && user.id === article.createdBy && (
            <button className="btn" onClick={() => setIsEditing(true)}>Update Article</button>
          )}
        </div>
      )}

      {article && isEditing && (
        <div className="create">
          <h2 className="page-title">Update Article</h2>
          <form onSubmit={handleUpdateSubmit}>
            <label>
              <span>Title:</span>
              <input type="text" onChange={(e) => setTitle(e.target.value)} value={title} required />
            </label>
            <label>
              <span>Author:</span>
              <input type="text" onChange={(e) => setAuthor(e.target.value)} value={author} required />
            </label>
            <label>
              <span>Description:</span>
              <textarea onChange={(e) => setDescription(e.target.value)} value={description} required />
            </label>
            <button type="submit" className="btn">Save Changes</button>
            <button type="button" className="btn" style={{background: '#777'}} onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
        </div>
      )}
    </div>
  );
}