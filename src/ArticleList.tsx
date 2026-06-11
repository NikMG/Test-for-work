import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { articlesApi } from './api/articles';
import { useAuth } from './context/AuthContext';
import { Article } from './types';
import { formatDate } from './utils/dateUtil';

export default function ArticleList() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const response = await articlesApi.getAll();
      setArticles(response.data.articles);
    } catch (error) {
      console.error('Failed to load articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavorite = async (slug: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        const response = await articlesApi.unfavorite(slug);
        setArticles(articles.map((article) => article.slug === slug ? response.data.article : article));
      } else {
        const response = await articlesApi.favorite(slug);
        setArticles(articles.map((article) => article.slug === slug ? response.data.article : article));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  //TODO make new component (?ArticlePreview?), wrap function in React.memo and render articles list using newly created component. This is necessary to prevent whole list reloading while client adds to favourite.
  const articlesList = () => {
    if (isLoading) return <p>Loading articles...</p>;
    
    return articles.map((article) => (
      <div className="article-preview" key={article.slug}>
        <div className="article-meta">
          <Link to={`/profile/${article.author.username}`}>
            <img 
              src={article.author.image || 'https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png'} 
              alt={article.author.username} 
            />
          </Link>
          <div className="info">
            <Link to={`/profile/${article.author.username}`} className="author">
              {article.author.username}
            </Link>
            <span className="date">{formatDate(article.createdAt)}</span>
          </div>
          <button 
            className={`btn ${article.favorited ? 'btn-primary' : 'btn-outline-primary'} btn-sm pull-xs-right`}
            onClick={() => handleFavorite(article.slug, article.favorited)}
          >
            <i className="ion-heart" /> {article.favoritesCount}
          </button>
        </div>
        <Link to={article.slug} className="preview-link">
          <h1>{article.title}</h1>
          <p>{article.description}</p>
          <span>Read more...</span>
        </Link>
      </div>                    
    ));
  }
  
  //TODO Refactor MainHeaderMenu Component and Footer Component. Transfer code to separate components and reuse it instead of duplicating
  return (
    <>
      <nav className="navbar navbar-light">
        <div className="container">
          <NavLink className="navbar-brand" to="/">
            conduit
          </NavLink>
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              {/* Add "active" class when you're on that page" */}
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/editor">
                <i className="ion-compose" />
                &nbsp;New Article
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/settings">
                <i className="ion-gear-a" />
                &nbsp;Settings
              </NavLink>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to={`/profile/${user.username}`}>
                    <img src={user.image || 'https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png'} className="user-img" alt={user.username} />
                    &nbsp;{user.username}
                  </NavLink>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/logout">Sign out</Link>
                </li>
              </>
            ) : (
              <>
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">
                  Sign in
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/register">
                  Sign up
                </NavLink>
              </li>
              </>
            )}
          </ul>
        </div>
      </nav>

      <div className="home-page">
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>

        <div className="container page">
          <div className="row">
            <div className="col-md-9">
              <div className="feed-toggle">
                <ul className="nav nav-pills outline-active">
                  <li className="nav-item">
                    <Link className="nav-link disabled" to="#">
                      Your Feed
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link active" to="#">
                      Global Feed
                    </Link>
                  </li>
                </ul>
              </div>

              {articlesList()}
            </div>

            <div className="col-md-3">
              <div className="sidebar">
                <p>Popular Tags</p>

                <div className="tag-list">
                  <a href="" className="tag-pill tag-default">
                    programming
                  </a>
                  <a href="" className="tag-pill tag-default">
                    javascript
                  </a>
                  <a href="" className="tag-pill tag-default">
                    emberjs
                  </a>
                  <a href="" className="tag-pill tag-default">
                    angularjs
                  </a>
                  <a href="" className="tag-pill tag-default">
                    react
                  </a>
                  <a href="" className="tag-pill tag-default">
                    mean
                  </a>
                  <a href="" className="tag-pill tag-default">
                    node
                  </a>
                  <a href="" className="tag-pill tag-default">
                    rails
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="container">
          <a href="/#" className="logo-font">
            conduit
          </a>
          <span className="attribution">
            An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design
            licensed under MIT.
          </span>
        </div>
      </footer>
    </>
  );
}
