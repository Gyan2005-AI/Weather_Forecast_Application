
// Replace with your OpenWeatherMap API key
const apiKey = 'b0fdc127467cc5270d3f8d7b593fd0df';
let map; 
let marker;

async function getWeather(city = null, lat = null, lon = null) {
  const currentWeather = document.getElementById("currentWeather");
  const forecast = document.getElementById("forecast");
  const forecastTitle = document.getElementById("forecastTitle");

  try {
    let weatherUrl, forecastUrl;

    if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
    } else if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    } else {
      currentWeather.innerHTML = "<p>Please enter a city or enable location!</p>";
      return;
    }

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (weatherData.cod !== 200) {
      currentWeather.innerHTML = "<p>❌ City not found</p>";
      forecast.innerHTML = "";
      forecastTitle.innerText = "";
      return;
    }

    // Current Weather Card
    currentWeather.innerHTML = `
      <h2>${weatherData.name}, ${weatherData.sys.country}</h2>
      <img src="http://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png" alt="Weather Icon">
      <h3>${weatherData.weather[0].description}</h3>
      <p>🌡 Temp: ${weatherData.main.temp}°C</p>
      <p>💧 Humidity: ${weatherData.main.humidity}%</p>
      <p>🌬 Wind: ${weatherData.wind.speed} m/s</p>
    `;

    // Forecast
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    const dailyForecast = forecastData.list.filter(f => f.dt_txt.includes("12:00:00"));

    forecast.innerHTML = "";
    forecastTitle.innerText = "5-Day Forecast";

    dailyForecast.forEach(day => {
      const date = new Date(day.dt_txt).toDateString();
      forecast.innerHTML += `
        <div class="forecast-card">
          <h4>${date}</h4>
          <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather Icon">
          <p>${day.weather[0].main}</p>
          <p>🌡 ${day.main.temp}°C</p>
        </div>
      `;
    });

    // Update Map
    updateMap(weatherData.coord.lat, weatherData.coord.lon, weatherData.name);

  } catch (error) {
    currentWeather.innerHTML = "<p>⚠ Error fetching weather data</p>";
    forecast.innerHTML = "";
    forecastTitle.innerText = "";
    console.error("Error:", error);
  }
}

// Search by input
function getWeatherByInput() {
  const city = document.getElementById("cityInput").value;
  getWeather(city);
}

// Auto detect location
window.onload = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => getWeather(null, pos.coords.latitude, pos.coords.longitude),
      err => {
        console.warn("Geolocation denied, fallback to Delhi");
        getWeather("Delhi");
      }
    );
  } else {
    getWeather("Delhi");
  }

  // Initialize map
  map = L.map("map").setView([28.61, 77.23], 5); // Default: Delhi
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
}

// Update map with marker
function updateMap(lat, lon, city) {
  map.setView([lat, lon], 10);

  if (marker) {
    map.removeLayer(marker);
  }

  marker = L.marker([lat, lon]).addTo(map).bindPopup(`<b>${city}</b>`).openPopup();
}
