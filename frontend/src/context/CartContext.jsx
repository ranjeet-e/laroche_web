import { createContext, useState, useContext } from 'react';

const CartContext = createContext(null);

const getItemKey = (item) => {
  if (item.key) return item.key;
  const addonKey = Array.isArray(item.addons) && item.addons.length > 0
    ? item.addons
        .map((a) => (typeof a === 'object' ? a._id || a.name : a))
        .sort()
        .join('+')
    : 'none';
  return `${item.menuItem || ''}::${item.name || ''}::${addonKey}`;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // item: { menuItem, name, price, basePrice?, addons?, quantity? }
  const addToCart = (item) => {
    const key = getItemKey(item);
    const itemWithKey = { ...item, key, addons: item.addons || [] };

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => getItemKey(i) === key);
      if (existingIndex > -1) {
        return prev.map((i, index) =>
          index === existingIndex ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i
        );
      }
      return [...prev, { ...itemWithKey, quantity: item.quantity || 1 }];
    });
  };

  const decreaseQuantity = (itemOrMenuItem, name) => {
    const key = typeof itemOrMenuItem === 'object'
      ? getItemKey(itemOrMenuItem)
      : name
      ? getItemKey({ menuItem: itemOrMenuItem, name })
      : null;

    setCartItems((prev) =>
      prev
        .map((i) => {
          const match = key ? getItemKey(i) === key : i.menuItem === itemOrMenuItem;
          return match ? { ...i, quantity: i.quantity - 1 } : i;
        })
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (itemOrMenuItem, name) => {
    const key = typeof itemOrMenuItem === 'object'
      ? getItemKey(itemOrMenuItem)
      : name
      ? getItemKey({ menuItem: itemOrMenuItem, name })
      : null;

    setCartItems((prev) =>
      prev.filter((i) => {
        if (key) return getItemKey(i) !== key;
        return !(i.menuItem === itemOrMenuItem && (!name || i.name === name));
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemQuantity = (menuItem, name) => {
    return cartItems
      .filter((i) => i.menuItem === menuItem && (!name || i.name === name))
      .reduce((sum, i) => sum + i.quantity, 0);
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
