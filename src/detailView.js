import { rootElement } from "./main";
import { getForecastWeather } from "./api";
import {
  formatHourlyTime,
  formatTemperature,
  formatToMilitaryTime,
  get24HoursForecastFromNow,
  getDayOfWeek,
} from "./utils";
import { renderLoadingScreen } from "./loading";
import { getConditionImagePath } from "./conditions";

export async function loadDetailView(cityName) {
  renderLoadingScreen("Lade Wetter für " + cityName + "...");
  const weatherData = await getForecastWeather(cityName);
  renderDetailView(weatherData);
  // eventlistener registrieren
}

function renderDetailView(weatherData) {
  const { location, current, forecast } = weatherData;
  const currentDay = forecast.forecastday[0];

  const conditionImage = getConditionImagePath(
    current.condition.code,
    current.is_day !== 1,
  );

  if (conditionImage) {
    rootElement.style = `--detail-condition-image: url("${conditionImage}")`;
    rootElement.classList.add("show-background");
  }

  rootElement.innerHTML =
    getHeaderHtml(
      location.name,
      formatTemperature(current.temp_c),
      current.condition.text,
      formatTemperature(currentDay.day.maxtemp_c),
      formatTemperature(currentDay.day.mintemp_c),
    ) +
    getTodayForecastHtml(
      currentDay.day.condition.text,
      currentDay.day.maxwind_kph,
      forecast.forecastday,
      current.last_updated_epoch,
    ) +
    getForecastHtml(forecast.forecastday) +
    getMiniStatsHtml(
      current.humidity,
      current.feelslike_c,
      currentDay.astro.sunrise,
      currentDay.astro.sunset,
      current.precip_mm,
      current.uv,
    );
}

function getHeaderHtml(location, currentTemp, condition, maxTemp, minTemp) {
  return `
          
       <div class="current-weather">
            <h2 class="current-weather__location"> ${location}</h2>
            <h1 class="current-weather__current-temperature">${currentTemp}°</h1>
            <p class="current-weather__condition">${condition}</p>
            <div class="current-weather_day-temperatures">
                <span class="current-weather__max-temperature">H:${maxTemp}°</span>
                <span class="current-weather__min-temperature">T:${minTemp}°</span>
           </div>
       </div>
     `;
}

function getTodayForecastHtml(
  condition,
  maxWind,
  forecastdays,
  lastUpdatedEpoch,
) {
  const hourlyForecastElements = get24HoursForecastFromNow(
    forecastdays,
    lastUpdatedEpoch,
  )
    .filter((el) => el !== undefined)
    .map(
      (hour, i) => `

               <div class="hourly-forecast">
                    <div class="hourly-forecast__time"> ${
                      i === 0 ? "Jetzt" : formatHourlyTime(hour.time) + " Uhr"
                    } </div>

                        <img
                          src="http:${hour.condition.icon}"
                          alt=""
                          class="hourly-forecast__icon"
                        />

                    <div class="hourly-forecast__temperature"> ${formatTemperature(
                      hour.temp_c,
                    )}°</div>
                </div>





    `,
    );
  const hourlyForecastHtml = hourlyForecastElements.join("");

  return `


  

          <div class="today-forecast">
                <div class="today-forecast__conditions">
                ${condition}. Wind bis zu ${maxWind}km/h.
                </div>

                <div class="today-forecast__hours">
                  ${hourlyForecastHtml}
              </div>
          </div>
        
          `;
}

function getForecastHtml(forecast) {
  const forecastElements = forecast.map(
    (forecastDay, i) => `

         <div class="forecast-day">
            <div class="forecast-day__day">${
              i === 0 ? "Heute" : getDayOfWeek(forecastDay.date)
            }</div>
            <img
              src="https:${forecastDay.day.condition.icon}"
              alt=""
              class="forecast-day__icon"
            />
            <div class="forecast-day__max-temp">H:${formatTemperature(
              forecastDay.day.maxtemp_c,
            )}°</div>
            <div class="forecast-day__min-temp">H:${formatTemperature(
              forecastDay.day.mintemp_c,
            )}°</div>
            <div class="forecast-day__wind"> ${
              forecastDay.day.maxwind_kph
            }km/h</div>
          </div>



    `,
  );

  const forecastHtml = forecastElements.join("");

  return `
     <div class="forecast">
        <div class="forecast__title">Vorhersage für die nächsten 3 Tage:</div>
        <div class="forecast__days">
          ${forecastHtml}
        </div>
      </div>
    
    `;
}

function getMiniStatsHtml(
  humidity,
  feelsLike,
  sunrise,
  sunset,
  precip,
  uvIndex,
) {
  return `

      <div class="mini-stats">
        <div class="mini-stat">
          <div class="mini-stat_heading">Feuchtigkeit</div>
          <div class="mini-stat__value">${humidity}%</div>
        </div>

        <div class="mini-stat">
          <div class="mini-stat_heading">Gefühlt</div>
          <div class="mini-stat__value"> ${feelsLike}° </div>
        </div>

        <div class="mini-stat">
          <div class="mini-stat_heading">Sonnenaufgang</div>
          <div class="mini-stat__value"> ${formatToMilitaryTime(
            sunrise,
          )} Uhr</div>
        </div>

        <div class="mini-stat">
          <div class="mini-stat_heading">Sonnenuntergang</div>
          <div class="mini-stat__value"> ${formatToMilitaryTime(
            sunset,
          )} Uhr</div>
        </div>

        <div class="mini-stat">
          <div class="mini-stat_heading">Niederschlag</div>
          <div class="mini-stat__value"> ${precip} mm</div>
        </div>

        <div class="mini-stat">
          <div class="mini-stat_heading">UV-Index</div>
          <div class="mini-stat__value"> ${uvIndex}</div>
        </div>

      </div>

   `;
}
