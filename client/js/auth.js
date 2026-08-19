// Handle login form
// Handle login form
const handleLogin = async (email, password) => {
  try {
    const data = await login({ email, password });
    setToken(data.token);
    setUser(data.user);
    window.location.href = "dashboard.html"; // Changed from index.html
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Handle register form
const handleRegister = async (full_name, email, phone, password, role) => {
  try {
    const data = await register({ full_name, email, phone, password, role });
    // Auto-login after registration
    const loginResult = await handleLogin(email, password);
    return loginResult;
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Handle logout
const handleLogout = () => {
  removeToken();
  removeUser();
  window.location.href = "index.html";
};

// Update navbar based on auth status
const updateNav = () => {
  const navLinks = document.getElementById("navLinks");
  if (!navLinks) return;

  if (isLoggedIn()) {
    const user = getUser();
    navLinks.innerHTML = `
            <span>Welcome, ${user?.full_name || "User"}</span>
            <a href="#" id="logoutLink">Logout</a>
            ${user?.role === "station_owner" ? '<a href="owner-dashboard.html">Dashboard</a>' : ""}
            ${user?.role === "admin" ? '<a href="admin-dashboard.html">Admin</a>' : ""}
        `;
    document.getElementById("logoutLink")?.addEventListener("click", (e) => {
      e.preventDefault();
      handleLogout();
    });
  } else {
    navLinks.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html">Register</a>
        `;
  }
};

// Run when page loads
document.addEventListener("DOMContentLoaded", updateNav);
