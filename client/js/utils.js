// Utility functions
const getToken = () => localStorage.getItem("token");
const setToken = (token) => localStorage.setItem("token", token);
const removeToken = () => localStorage.removeItem("token");

const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
const removeUser = () => localStorage.removeItem("user");

const isLoggedIn = () => !!getToken();

const formatPrice = (price) => {
  return price ? `₦${price.toLocaleString()}` : "N/A";
};

const getStatusClass = (isOpen) => {
  return isOpen ? "open" : "closed";
};

const getStatusText = (isOpen) => {
  return isOpen ? "Open" : "Closed";
};
