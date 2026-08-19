const API_BASE_URL = "http://localhost:5000/api";

// Helper function for API calls
const apiRequest = async (
  endpoint,
  method = "GET",
  body = null,
  requiresAuth = false,
) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
};

// ===== AUTH APIs =====
const register = (userData) => apiRequest("/auth/register", "POST", userData);
const login = (credentials) => apiRequest("/auth/login", "POST", credentials);

// ===== STATION APIs (Public) =====
const getStations = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/stations${params ? "?" + params : ""}`, "GET");
};

const getStationById = (id) => apiRequest(`/stations/${id}`, "GET");

// ===== STATION APIs (Protected) =====
const createStation = (stationData) =>
  apiRequest("/stations", "POST", stationData, true);
const updateStation = (id, stationData) =>
  apiRequest(`/stations/${id}`, "PUT", stationData, true);
const deleteStation = (id) =>
  apiRequest(`/stations/${id}`, "DELETE", null, true);
const getMyStations = () =>
  apiRequest("/stations/my-stations", "GET", null, true);

// ===== REVIEW APIs =====
const getReviews = (stationId) =>
  apiRequest(`/stations/${stationId}/reviews`, "GET");
const leaveReview = (stationId, reviewData) =>
  apiRequest(`/stations/${stationId}/reviews`, "POST", reviewData, true);

// ===== ADMIN APIs - Stations =====
const getPendingStations = () =>
  apiRequest("/admin/stations/pending", "GET", null, true);
const getAllStations = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(
    `/admin/stations/all${params ? "?" + params : ""}`,
    "GET",
    null,
    true,
  );
};
const approveStation = (stationId) =>
  apiRequest(`/admin/stations/${stationId}/approve`, "PUT", null, true);
const rejectStation = (stationId) =>
  apiRequest(`/admin/stations/${stationId}/reject`, "PUT", null, true);
const adminDeleteStation = (stationId) =>
  apiRequest(`/admin/stations/${stationId}`, "DELETE", null, true);

// ===== ADMIN APIs - Users =====
const getUsers = () => apiRequest("/admin/users", "GET", null, true);
const getUserById = (userId) =>
  apiRequest(`/admin/users/${userId}`, "GET", null, true);
const activateUser = (userId) =>
  apiRequest(`/admin/users/${userId}/activate`, "PUT", null, true);
const deactivateUser = (userId) =>
  apiRequest(`/admin/users/${userId}/deactivate`, "PUT", null, true);
const deleteUser = (userId) =>
  apiRequest(`/admin/users/${userId}`, "DELETE", null, true);
