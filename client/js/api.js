const API_BASE_URL = "http://localhost:5000/api";

// Helper functions
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

// Auth APIs
const register = (userData) => apiRequest("/auth/register", "POST", userData);
const login = (credentials) => apiRequest("/auth/login", "POST", credentials);

// Station APIs (Public)
const getStations = (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  return apiRequest(`/stations${params ? "?" + params : ""}`, "GET");
};

const getStationById = (id) => apiRequest(`/stations/${id}`, "GET");

// Station APIs (Protected)
const createStation = (stationData) =>
  apiRequest("/stations", "POST", stationData, true);
const updateStation = (id, stationData) =>
  apiRequest(`/stations/${id}`, "PUT", stationData, true);
const deleteStation = (id) =>
  apiRequest(`/stations/${id}`, "DELETE", null, true);
const getMyStations = () =>
  apiRequest("/stations/my-stations", "GET", null, true);

// Review APIs
const getReviews = (stationId) =>
  apiRequest(`/stations/${stationId}/reviews`, "GET");
const leaveReview = (stationId, reviewData) =>
  apiRequest(`/stations/${stationId}/reviews`, "POST", reviewData, true);

// Admin APIs
const getPendingStations = () =>
  apiRequest("/admin/stations/pending", "GET", null, true);
const approveStation = (stationId) =>
  apiRequest(`/admin/stations/${stationId}/approve`, "PUT", null, true);
const rejectStation = (stationId) =>
  apiRequest(`/admin/stations/${stationId}/reject`, "PUT", null, true);
const getUsers = () => apiRequest("/admin/users", "GET", null, true);
const deactivateUser = (userId) =>
  apiRequest(`/admin/users/${userId}`, "DELETE", null, true);
