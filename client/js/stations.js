// Load stations with filters
const loadStations = async (filters = {}) => {
  const container = document.getElementById("stationsList");
  container.innerHTML = '<p class="loading">Loading stations...</p>';

  try {
    const data = await getStations(filters);

    if (data.count === 0) {
      container.innerHTML =
        "<p>No stations found. Be the first to add one!</p>";
      return;
    }

    container.innerHTML = data.stations
      .map(
        (station) => `
    <div class="station-card" onclick="viewStation('${station.id}')">
        <h3>${station.name}</h3>
        <div class="address">${station.address}, ${station.city}</div>
        <div class="price">${formatPrice(station.petrol_price)}</div>
        <div class="status ${getStatusClass(station.is_open)}">${getStatusText(station.is_open)}</div>
        <small>Updated: ${new Date(station.price_last_updated).toLocaleDateString()}</small>
    </div>
`,
      )
      .join("");
  } catch (error) {
    container.innerHTML = `<p>Error loading stations: ${error.message}</p>`;
  }
};

// View station details
const viewStation = (id) => {
  window.location.href = `station-detail.html?id=${id}`;
};

// Apply filters
const applyFilters = () => {
  const filters = {
    city: document.getElementById("cityFilter")?.value || "",
    fuel_type: document.getElementById("fuelFilter")?.value || "",
    is_open: document.getElementById("statusFilter")?.value || "",
  };
  // Remove empty filters
  Object.keys(filters).forEach((key) => {
    if (!filters[key]) delete filters[key];
  });
  loadStations(filters);
};

// Load stations on page load
document.addEventListener("DOMContentLoaded", () => {
  const applyBtn = document.getElementById("applyFilters");
  if (applyBtn) {
    applyBtn.addEventListener("click", applyFilters);
  }
  loadStations();
});
