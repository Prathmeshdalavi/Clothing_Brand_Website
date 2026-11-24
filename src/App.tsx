import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import { CollectionPage, CollectionsIndex, NewArrivalsPage, ShopPage } from './pages/Shop'
import ProductPage from './pages/ProductPage'
import { CartPage, WishlistPage } from './pages/CartPages'
import Checkout from './pages/Checkout'
import { OrderConfirmation, TrackOrder } from './pages/OrderPages'
import Account from './pages/Account'
import { About, Contact, Faq, NotFound, PolicyPage } from './pages/Static'

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/Products'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminInventory = lazy(() => import('./pages/admin/Inventory'))
const AdminCustomers = lazy(() => import('./pages/admin/Customers'))
const AdminReports = lazy(() => import('./pages/admin/Reports'))
const AdminSettings = lazy(() => import('./pages/admin/SettingsPage'))

const Loading = () => <div className="min-h-[50vh] grid place-items-center text-sm text-charcoal/50" role="status">Loading…</div>

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<ShopPage />} />
          <Route path="new-arrivals" element={<NewArrivalsPage />} />
          <Route path="collections" element={<CollectionsIndex />} />
          <Route path="collections/:category" element={<CollectionPage />} />
          <Route path="product/:slug" element={<ProductPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="account" element={<Account />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="faq" element={<Faq />} />
          <Route path="services" element={<Navigate to="/faq" replace />} />
          {['shipping-policy', 'return-policy', 'cancellation-policy', 'privacy-policy', 'terms', 'payment-policy'].map((s) => (
            <Route key={s} path={s} element={<PolicyPage slug={s} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
