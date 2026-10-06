import { Route, Routes } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import { RequireAuth, RequireRole } from './components/ProtectedRoute';
import Home from './pages/Home';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import AdminHome from './pages/Dashboard/AdminHome';
import BooksAdmin from './pages/Dashboard/BooksAdmin';
import BookForm from './pages/Dashboard/BookForm';
import CategoriesAdmin from './pages/Dashboard/CategoriesAdmin';
import UsersAdmin from './pages/Dashboard/UsersAdmin';
import SettingsAdmin from './pages/Dashboard/SettingsAdmin';
import MessagesAdmin from './pages/Dashboard/MessagesAdmin';

export default function App() {
  return (
    <Routes>
      
      <Route element={<PublicLayout transparentHeader />}>
        <Route index element={<Home />} />
      </Route>
      <Route element={<PublicLayout />}>
        <Route path="books" element={<Books />} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="login" element={<Login />} />
      </Route>

      
      <Route
        path="admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="books" element={<BooksAdmin />} />
        <Route path="books/new" element={<BookForm />} />
        <Route path="books/:id/edit" element={<BookForm />} />
        <Route path="categories" element={<CategoriesAdmin />} />
        <Route
          path="users"
          element={
            <RequireRole roles={['admin']}>
              <UsersAdmin />
            </RequireRole>
          }
        />
        <Route
          path="settings"
          element={
            <RequireRole roles={['admin']}>
              <SettingsAdmin />
            </RequireRole>
          }
        />
        <Route
          path="messages"
          element={
            <RequireRole roles={['admin']}>
              <MessagesAdmin />
            </RequireRole>
          }
        />
      </Route>

      <Route path="*" element={<PublicLayout />}>
        <Route
          path="*"
          element={
            <div className="mx-auto max-w-xl px-4 pb-20 pt-32 text-center">
              <p className="font-display text-5xl">404</p>
              <a href="/" className="mt-4 inline-block rounded-md bg-ink px-5 py-2.5 text-sm font-bold text-cream">DOCTOPIA - /</a>
            </div>
          }
        />
      </Route>
    </Routes>
  );
}
