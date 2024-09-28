const todayForecast = document.querySelector("#todayForecast");

document.addEventListener("keydown", (event) => {
  if (event.key == "Enter") validateCity();
});

const fetchWeatherData = async (cityName) => {
  try {
    let fetchedData = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${Your_App_Key_Here}&units=metric`,
      { mode: "cors" }
    );
    let currentDayData = await fetchedData.json();
    clearData();
    document.querySelector("#todayForecast_City").textContent =
      currentDayData.name + ", " + currentDayData.sys.country;
    populateFutureForecast(currentDayData.coord.lat, currentDayData.coord.lon);
  } catch (error) {
    alert("Oops! Incorrect city name entered. Please try again.");
    console.log(error);
  }
};

const clearData = () => {
  let tableTodayForecast = document.querySelector("#todayForecast_Table");
  while (tableTodayForecast.firstChild)
    tableTodayForecast.removeChild(tableTodayForecast.firstChild);

  let futureTableForecast = document.querySelector("#futureForecast_Table");
  while (futureTableForecast.firstChild)
    futureTableForecast.removeChild(futureTableForecast.firstChild);

  todayForecast.style.borderBottom = "";
  document.querySelector("#todayForecast_City").textContent = "";
  document.querySelector("#todayForecast_Date").textContent = "";
  document.querySelector("#futureForecast_Heading").textContent = "";
};

const drillAndFetchData = (data, attribute) => {
  const weatherOptions = {
    Date: (_) => transformDate(data.dt, "Date"),
    Temperature: (_) => fetchTemperature(data),
    "Weather Type": (_) => fetchWeatherIcon(data),
    "Possiblity of Rain": (_) => fetchRainPossiblity(data),
    "Weather Conditions": (_) => fetchWeatherConditions(data),
    Humidity: (_) => fetchHumidity(data),
    Sunrise: (_) => transformDate(data.sunrise, "Time"),
    Sunset: (_) => transformDate(data.sunset, "Time"),
  };
  if (weatherOptions.hasOwnProperty(attribute))
    return weatherOptions[attribute]();
};

const transformDate = (data, requiredDateType) => {
  if (requiredDateType) {
    return new Date(data * 1000).toLocaleString("en-us", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } else {
    return new Date(data * 1000).toLocaleString("en-us", {
      hour: "numeric",
      minute: "numeric",
    });
  }
};

const fetchTemperature = (data) => {
  return data.temp.max.toFixed(1) + "°/" + data.temp.min.toFixed(1) + "°";
};

const fetchHumidity = (data) => {
  return data.humidity + "%";
};

const fetchWeatherIcon = (data) => {
  return `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
};

const fetchRainPossiblity = (data) => {
  return (data.pop * 100).toFixed(1) + "%";
};

const fetchWeatherConditions = (data) => {
  return data.weather[0].description;
};

const populateFutureForecast = async (latitutde, longitude) => {
  let fetchedData = await fetch(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${latitutde}&lon=${longitude}&appid=${Your_App_Key_Here}&exclude=current,minutely,hourly&units=Metric`,
    { mode: "cors" }
  );
  let futureDaysData = await fetchedData.json();
  futureDaysData = futureDaysData.daily;
  populateTodayForecast(futureDaysData[0]);
  futureDaysData.shift();

  document.querySelector("#futureForecast_Heading").textContent =
    "Forecast for next week";

  const table = document.querySelector("#futureForecast_Table");

  const requiredWeatherProperties = [
    "Date",
    "Weather Type",
    "Temperature",
    "Humidity",
    "Weather Conditions",
    "Possiblity of Rain",
    "Sunrise",
    "Sunset",
  ];
  requiredWeatherProperties.forEach(function (weatherProperty) {
    const tr = document.createElement("tr");
    tr.style.textAlign = "center";
    let counter = 0;
    futureDaysData.forEach(function (dailyData) {
      if (counter == 0) {
        const th = document.createElement("th");
        th.textContent = weatherProperty;
        tr.appendChild(th);
      }
      const td = document.createElement("td");
      let fieldData = drillAndFetchData(dailyData, weatherProperty);
      if (weatherProperty == "Weather Type") {
        const img = document.createElement("img");
        img.src = fieldData;
        td.appendChild(img);
      } else td.textContent = fieldData;
      tr.appendChild(td);
      counter++;
    });
    table.appendChild(tr);
  });
};

const populateTodayForecast = (data) => {
  document.querySelector("#todayForecast_Date").textContent =
    "Today's Forecast - " + drillAndFetchData(data, "Date");

  document.querySelector("#todayForecast_Type").src = drillAndFetchData(
    data,
    "Weather Type"
  );

  const table = document.querySelector("#todayForecast_Table");

  const requiredWeatherProperties = [
    "Temperature",
    "Humidity",
    "Weather Conditions",
    "Possiblity of Rain",
    "Sunrise",
    "Sunset",
  ];
  requiredWeatherProperties.forEach(function (weatherProperty) {
    const tr = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = weatherProperty;
    tr.appendChild(th);

    const td = document.createElement("td");
    let fetchedData = drillAndFetchData(data, weatherProperty);
    td.textContent = fetchedData;
    tr.appendChild(td);

    table.appendChild(tr);
  });
  todayForecast.style.borderBottom = "1px solid black";
};

const validateCity = () => {
  let city = document.getElementById("city_name").value;
  if (city != "") {
    city = city.toLowerCase();
    city = city[0].toUpperCase() + city.slice(1);
    document.getElementById("city_name").value = "";
    fetchWeatherData(city);
  } else alert("Oops! Enter a City First.");
};
