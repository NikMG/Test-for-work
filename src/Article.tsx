import React, { useState, useEffect } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { articlesApi } from './api/articles';
import { profilesApi } from './api/profiles';
import { useAuth } from './context/AuthContext';
import { Article as ArticleType } from './types';
import { formatDate } from './utils/dateUtil';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authorFollowing, setAuthorFollowing] = useState(false);

  useEffect(() => {
    if (slug) loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setIsLoading(true);
    try {
      const response = await articlesApi.getBySlug(slug);
      setArticle(response.data.article);
      setAuthorFollowing(response.data.article.author.following);
    } catch (error) {
      console.error('Failed to load article', error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFavourite = async () => {
    if (!article) return;

    try {
      const response = article.favorited ? await articlesApi.unfavorite(article.slug) : await articlesApi.favorite(article.slug);
      setArticle(response.data.article);
    } catch (error) {
      console.error('Failed when working with favorite', error);
    }
  }

  const handleFollowAuthor = async () => {
    if (!article) return;

    try {
      if (authorFollowing) {
        const response = await profilesApi.unfollow(article.author.username);
        setArticle({ ...article, author: response.data.profile });
        setAuthorFollowing(false);
      } else {
        const response = await profilesApi.follow(article.author.username);
        setArticle({ ...article, author: response.data.profile });
        setAuthorFollowing(true);
      }
    } catch (error) {
      console.error('Failed when working with following', error);
    }
  }

  if (isLoading || !article) {
    return <p>Loading article...</p>;
  }

  const renderedBody = () => {
    const text = marked.parse(article.body) as string;

    const cleanHtml = DOMPurify.sanitize(text);

    return cleanHtml;
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

      <div className="article-page">
        <div className="banner">
          <div className="container">
            <h1>{article.title}</h1>

            <div className="article-meta">
              <Link to={`/profile/${article.author.username}`}>
                <img src={article.author.image || 'https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png'} alt={article.author.username} />
              </Link>
              <div className="info">
                <Link to={`/profile/${article.author.username}`} className="author">
                  {article.author.username}
                </Link>
                <span className="date">{formatDate(article.createdAt)}</span>
              </div>
              <button 
                className={`btn btn-sm ${authorFollowing ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={handleFollowAuthor}
              >
                <i className="ion-plus-round" />
                &nbsp; {authorFollowing ? 'Unfollow' : 'Follow'} {article.author.username} <span className="counter">(TODO)</span>
              </button>
              &nbsp;&nbsp;
              <button 
                className={`btn btn-sm ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={handleFavourite}
                >
                <i className="ion-heart" />
                &nbsp; {article.favorited ? 'Unfavorite' : 'Favorite'} Post <span className="counter">({article.favoritesCount})</span>
              </button>
            </div>
          </div>
        </div>

        <div className="container page">
          <div className="row article-content">
            <div className="col-md-12">
              <div dangerouslySetInnerHTML={{ __html: renderedBody() }} />
            </div>
          </div>

          <hr />

          <div className="article-actions">
            <div className="article-meta">
              <Link to={`/profile/${article.author.username}`}>
                <img src={article.author.image || 'https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png'} alt={article.author.username} />
              </Link>
              <div className="info">
                <Link to={`/profile/${article.author.username}`} className="author">
                  {article.author.username}
                </Link>
                <span className="date">{formatDate(article.createdAt)}</span>
              </div>
              <button 
                className={`btn btn-sm ${authorFollowing ? 'btn-secondary' : 'btn-outline-secondary'}`}
                onClick={handleFollowAuthor}
              >
                <i className="ion-plus-round" />
                &nbsp; {authorFollowing ? 'Ufollow' : 'Follow'} {article.author.username}
              </button>
              &nbsp;
              <button 
                className={`btn btn-sm ${article.favorited ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={handleFavourite}
              >
                <i className="ion-heart" />
                &nbsp; {article.favorited ? 'Unfavorite' : 'Favorite'} Post <span className="counter">({article.favoritesCount})</span>
              </button>
            </div>
          </div>

          <div className="row">
            <div className="col-xs-12 col-md-8 offset-md-2">
              <form className="card comment-form">
                <div className="card-block">
                  <textarea className="form-control" placeholder="Write a comment..." rows={3} />
                </div>
                <div className="card-footer">
                  <img src="http://i.imgur.com/Qr71crq.jpg" className="comment-author-img" />
                  <button className="btn btn-sm btn-primary">Post Comment</button>
                </div>
              </form>

              <div className="card">
                <div className="card-block">
                  <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                </div>
                <div className="card-footer">
                  <a href="/#/profile/jacobschmidt" className="comment-author">
                    <img src="http://i.imgur.com/Qr71crq.jpg" className="comment-author-img" />
                  </a>
                  &nbsp;
                  <a href="/#/profile/jacobschmidt" className="comment-author">
                    Jacob Schmidt
                  </a>
                  <span className="date-posted">Dec 29th</span>
                </div>
              </div>

              <div className="card">
                <div className="card-block">
                  <p className="card-text">With supporting text below as a natural lead-in to additional content.</p>
                </div>
                <div className="card-footer">
                  <a href="/#/profile/jacobschmidt" className="comment-author">
                    <img src="http://i.imgur.com/Qr71crq.jpg" className="comment-author-img" />
                  </a>
                  &nbsp;
                  <a href="/#/profile/jacobschmidt" className="comment-author">
                    Jacob Schmidt
                  </a>
                  <span className="date-posted">Dec 29th</span>
                  <span className="mod-options">
                    <i className="ion-edit" />
                    <i className="ion-trash-a" />
                  </span>
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
