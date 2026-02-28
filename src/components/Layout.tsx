import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '1.5rem' }}>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
