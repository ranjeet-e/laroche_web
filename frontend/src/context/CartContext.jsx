import { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // item: { menuItem, name, price, quantity }
  const addToCart = (item) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (i) => i.menuItem === item.menuItem && i.name === item.name
      );
      if (existing) {
        return prev.map((i) =>
          i.menuItem === item.menuItem && i.name === item.name
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const decreaseQuantity = (menuItem, name) => {
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.menuItem === menuItem && i.name === name
            ? { ...i, quantity: i.quantity - 1 }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (menuItem, name) => {
    setCartItems((prev) =>
      prev.filter((i) => !(i.menuItem === menuItem && i.name === name))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemQuantity = (menuItem, name) => {
    const item = cartItems.find((i) => i.menuItem === menuItem && i.name === name);
    return item ? item.quantity : 0;
  };

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        totalItems,
        totalAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
