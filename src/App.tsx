import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./store/cart";
import { NavBar } from "./components/NavBar";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";

import { HomePage } from "./pages/HomePage";
import { EventPage } from "./pages/EventPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { AboutPage } from "./pages/AboutPage";
import { AdminEntry } from "./pages/admin/AdminEntry";

export function App() {
  const [cartOpen, setCartOpen] = React.useState(false);

  return (
    <HashRouter>
      <CartProvider>
        <NavBar onOpenCart={() => setCartOpen(true)} />
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin/*" element={<AdminEntry />} />
        </Routes>

        <Footer />
      </CartProvider>
    </HashRouter>
  );
}
