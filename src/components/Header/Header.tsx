import { NavLink, useLocation } from 'react-router-dom';
import { NavItem } from '../NavItem/NavItem';
import { useAuth } from '@/features/auth';
import { APP_TITLE } from '@/config';
import logo from '@/assets/logo.svg';

export function Header() {
  const { user } = useAuth();

  return (
    <nav className='navbar navbar-expand navbar-scroll bg-body-tertiary'>
      <div className='container'>
        <NavLink to='/' className='navbar-brand'>
          {APP_TITLE}
          <img className='align-top' src={logo} alt={APP_TITLE} style={{ height: '30px' }} />
        </NavLink>

        <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>{user ? <UserLinks /> : <GuestLinks />}</ul>
      </div>
    </nav>
  );
}

function GuestLinks() {
  const location = useLocation();
  const generateLink = (path: string) =>
    `${path}${
      location.pathname !== '/login' && location.pathname !== '/register'
        ? `?redirect=${location.pathname}`
        : location.search
    }`;

  return (
    <>
      <NavItem text='Login' to={generateLink('/login')} />
      <NavItem text='Register' to={generateLink('/register')} />
    </>
  );
}

function UserLinks() {
  const { user, logout } = useAuth();
  const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() ?? user?.email;

  return (
    <>
      <NavItem text='+ Add post' to='/posts/add' className='btn btn-outline-primary rounded-pill me-2' />
      <NavItem to='/profile' className='btn btn-outline-secondary rounded-pill me-2'>
        <img className='rounded-circle bg-body me-2' src={user?.image} width='24' height='24' alt={name} />
        {name}
      </NavItem>
      <NavItem text='Settings' to='/settings' />
      <NavItem type='button' text='Logout' onClick={logout} />
    </>
  );
}
