import React, { useState, useEffect } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';
import { profilesApi } from './api/profiles';
import { articlesApi } from './api/articles';
import { useAuth } from './context/AuthContext';
import { Profile as ProfileType, Article } from './types';
import { formatDate } from './utils/dateUtil';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
     if (username) {
       loadProfileAndArticles();
      }
  }, [username]);

  const loadProfileAndArticles = async () => {
    setIsLoading(true);
    try {
      const [profileResponse, articlesResponse] = await Promise.all([
        profilesApi.get(username),
        articlesApi.getAll({ author: username })
      ]);
      
      setProfile(profileResponse.data.profile);
      setArticles(articlesResponse.data.articles);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!profile || !user) return;
    
    try {
      if (profile.following) {
        const response = await profilesApi.unfollow(profile.username);
        setProfile(response.data.profile);
      } else {
        const response = await profilesApi.follow(profile.username);
        setProfile(response.data.profile);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
    }
  };

  const handleFavorite = async (slug: string, isFavorited: boolean) => {
    try {
      if (isFavorited) {
        const response = await articlesApi.unfavorite(slug);
        setArticles(articles.map((article) => 
          article.slug === slug ? response.data.article : article
        ));
      } else {
        const response = await articlesApi.favorite(slug);
        setArticles(articles.map((article) => 
          article.slug === slug ? response.data.article : article
        ));
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

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
        <Link to={`/${article.slug}`} className="preview-link">
          <h1>{article.title}</h1>
          <p>{article.description}</p>
          <span>Read more...</span>
        </Link>
      </div>                    
    ));
  }

  if (isLoading || !profile) {
    return <p>Loading profile...</p>;
  }

  const isOwnProfile = user?.username === profile.username;

  return (
    <>
      <nav className="navbar navbar-light">
        <div className="container">
          <Link className="navbar-brand" to="/">
            conduit
          </Link>
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

      <div className="profile-page">
        <div className="user-info">
          <div className="container">
            <div className="row">
              <div className="col-xs-12 col-md-10 offset-md-1">
                <img src={profile.image || 'https://miro.medium.com/v2/resize:fill:64:64/1*dmbNkD5D-u45r44go_cf0g.png'} className="user-img" alt={profile.username} />
                <h4>{profile.username}</h4>
                <p>{profile.bio}</p>
                {!isOwnProfile && user && (
                  <button 
                    className={`btn btn-sm ${profile.following ? 'btn-secondary' : 'btn-outline-secondary'} action-btn`}
                    onClick={handleFollow}
                  >
                    <i className="ion-plus-round" />
                    &nbsp; {profile.following ? 'Unfollow' : 'Follow'} {profile.username}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="row">
            <div className="col-xs-12 col-md-10 offset-md-1">
              <div className="articles-toggle">
                <ul className="nav nav-pills outline-active">
                  <li className="nav-item">
                    <Link className="nav-link" to={`/profile/${profile.username}`}>
                      My Articles
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to={`/profile/${profile.username}/favorite`}>
                      Favorited Articles
                    </Link>
                  </li>
                </ul>
              </div>

              {articlesList()}
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
