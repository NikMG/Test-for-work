import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Link, useLocation, Redirect, NavLink } from 'react-router-dom';

export default function LoginRegister() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ field: string; message: string }[]>([]);
  const location = useLocation();


  if (user) {
    return <Redirect to="/" />;
  }

  const isLogin = location.pathname === '/login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    try {
      if (isLogin) {
        await login(email, password);
        window.location.href = '/';
      } else {
        setErrors([{ field: 'general', message: 'Registration is not implemented' }]);
      }
    } catch (error: any) {
      const apiErrors = error.response?.data?.errors;
      if (apiErrors) {
        const extractedErrors: { field: string; message: string }[] = [];
        Object.entries(apiErrors).forEach(([field, messages]) => {
          (messages as string[]).forEach((message) => {
            extractedErrors.push({ field, message });
          });
        });
        setErrors(extractedErrors);
      } else {
        setErrors([{ field: 'general', message: error.message || 'An error occurred' }]);
      }
    }
    };

  //TODO Refactor MainHeaderMenu Component and Footer Component. Transfer code to separate components and reuse it instead of duplicating
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
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">
                Sign in
              </NavLink>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/register">
                Sign up
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      <div className="auth-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">{isLogin ? 'Sign in' : 'Sign up'}</h1>
              <p className="text-xs-center">
                {isLogin ? (
                  <Link to='/register'>Need an account ?</Link>
                ) : (
                  <Link to='/login'>Have an account ?</Link>
                )}
              </p>
              
              {errors.length > 0 && (
                <ul className="error-messages">
                  {errors.map((error, index) => (
                    <li key={index}>{error.message}</li>
                  ))}
                </ul>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <fieldset className="form-group">
                    <input className="form-control form-control-lg" type="text" placeholder="Your Name" />
                  </fieldset>
                )}
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" value={email} onChange={(e) => setEmail(e.target.value)} type="text" placeholder="Email" />
                </fieldset>
                <fieldset className="form-group">
                  <input className="form-control form-control-lg" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" />
                </fieldset>
                <button className="btn btn-lg btn-primary pull-xs-right">{isLogin ? 'Sign in' : 'Sign up'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <footer>
        <div className="container">
          <Link to="/" className="logo-font">
            conduit
          </Link>
          <span className="attribution">
            An interactive learning project from <a href="https://thinkster.io">Thinkster</a>. Code &amp; design
            licensed under MIT.
          </span>
        </div>
      </footer>
    </>
  );
}
