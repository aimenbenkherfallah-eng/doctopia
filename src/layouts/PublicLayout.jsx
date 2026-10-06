import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

export function PublicLayout({ transparentHeader = false }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-cream text-ink">
      <Header transparentOverHero={transparentHeader} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
