const API_BASE_URL = "https://api.weatherapi.com/v1";
const API_KEY = "d2b9487cc15e4ae782c70937262001";
const FAVORITE_CITIES_KEY = "favorite-cities";

export async function getForecastWeather(location, days = 3) {
  const response = await fetch(
    `${API_BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&lang=de&days=${days}`,
  );

  const weatherData = await response.json();

  console.log(weatherData);

  return weatherData;
}

export function getFavoriteCities() {
  return JSON.parse(localStorage.getItem(FAVORITE_CITIES_KEY)) || [];
}

export function saveCityAsFavoriter(city) {
  const favorites = getFavoriteCities();

  if (favorites.find((favorite) => favorite === city)) {
    alert(city + " wurde bereits den Favoriten hinzugefügt!");
    return;
  }
  favorites.push(city);

  localStorage.setItem(FAVORITE_CITIES_KEY, JSON.stringify(favorites));
}

export function removeCityFromFavorites(city) {
  const favorites = getFavoriteCities();

  const filteredFavorites = favorites.filter((favorite) => favorite !== city);

  localStorage.setItem(FAVORITE_CITIES_KEY, JSON.stringify(filteredFavorites));
}
