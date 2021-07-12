const futureForecast = document.querySelector("#futureForecast");
const todayForecast = document.querySelector("#todayForecast");

document.addEventListener("keydown",(event) => {
    if(event.key == "Enter") validateCity();
})

const fetchWeatherData = async(cityName) => {
    try {
    let fetchedData = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${Your_App_Key_Here}&units=metric`,{mode:'cors'});    
    let currentDayData = await fetchedData.json();
    clearData();

    h1 = document.createElement("h1");
    h1.textContent = currentDayData.name+", "+currentDayData.sys.country;
    h1.style.textAlign = "center";
    todayForecast.appendChild(h1);

    populateFutureForecast(currentDayData.coord.lat, currentDayData.coord.lon);
    } catch {
        alert("Oops! Incorrect city name entered. Please try again.");
    }
}

const clearData = () => {
    while(todayForecast.firstChild) todayForecast.removeChild(todayForecast.firstChild)
    while(futureForecast.firstChild) futureForecast.removeChild(futureForecast.firstChild)
    todayForecast.style.borderBottom = "";
}

const drillAndFetchData = (data,attribute) => {
    let fieldData = "";
    if(attribute == "Date"){
        fieldData = new Date(data.dt * 1000).toLocaleString("en-us",{month:"long",day:"numeric",year:"numeric"});
    } else if(attribute == "Temperature"){
        fieldData = (data.temp.max).toFixed(1)+"°/"+(data.temp.min).toFixed(1)+"°";
    } else if(attribute == "Weather Type"){
        fieldData = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`
    } else if(attribute == "Humidity"){
        fieldData = data.humidity+"%";
    } else if (attribute == "Possiblity of Rain"){
        fieldData = (data.pop * 100).toFixed(1)+"%";
    } else if (attribute == "Weather Conditions"){
        fieldData = data.weather[0].description;
    } else if (attribute == "Sunrise"){
        fieldData = new Date(data.sunrise * 1000).toLocaleString("en-us",{hour:"numeric",minute:"numeric"});
    } else if (attribute == "Sunset"){
        fieldData = new Date(data.sunset * 1000).toLocaleString("en-us",{hour:"numeric",minute:"numeric"});
    }
    return fieldData;
}

const populateFutureForecast = async(latitutde, longitude) => {

    fetchedData = await fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitutde}&lon=${longitude}&appid=${Your_App_Key_Here}&exclude=current,minutely,hourly&units=Metric`,{mode:'cors'});
    let futureDaysData = await fetchedData.json();
    futureDaysData = futureDaysData.daily;
    populateTodayForecast(futureDaysData[0]);
    futureDaysData.shift();

    const h2 = document.createElement("h2");
    h2.style.textAlign = "center";
    h2.textContent = "Forecast for next week"
    futureForecast.appendChild(h2);

    const table = document.createElement("table");
    table.setAttribute("border", 1);
    table.style.marginBottom = "10px";

    const requiredWeatherProperties = ["Date", "Weather Type","Temperature","Humidity","Weather Conditions","Possiblity of Rain","Sunrise","Sunset"]
    requiredWeatherProperties.forEach(function(weatherProperty){
        const tr = document.createElement("tr");
        tr.style.textAlign = "center";
        counter = 0;
        futureDaysData.forEach(function(dailyData){
            if(counter == 0){
                const th = document.createElement("th");
                th.textContent = weatherProperty;
                tr.appendChild(th);
            }
            const td = document.createElement("td");
            let fieldData = drillAndFetchData(dailyData, weatherProperty);
            if(weatherProperty == "Weather Type"){
                const img = document.createElement("img");
                img.src = fieldData;
                td.appendChild(img);
            }
            else td.textContent = fieldData;
            tr.appendChild(td);
            counter++;
        });
        table.appendChild(tr);
    });
    futureForecast.appendChild(table);
}

const populateTodayForecast = (data) => {

    h2 = document.createElement("h2");
    h2.textContent = "Today's Forecast - "+drillAndFetchData(data,"Date");
    todayForecast.appendChild(h2);

    const img = document.createElement("img");
    img.src = drillAndFetchData(data,"Weather Type");
    todayForecast.appendChild(img);

    const table = document.createElement("table");
    table.setAttribute("border", 1);
    table.style.marginBottom = "10px";

    const requiredWeatherProperties = ["Temperature","Humidity","Weather Conditions","Possiblity of Rain","Sunrise","Sunset"]
    requiredWeatherProperties.forEach(function(weatherProperty){
        const tr = document.createElement("tr");

        const th = document.createElement("th");
        th.textContent = weatherProperty;
        tr.appendChild(th)

        const td = document.createElement("td");
        fetchedData = drillAndFetchData(data, weatherProperty)
        td.textContent = fetchedData ;
        tr.appendChild(td);

        table.appendChild(tr);
    })
    todayForecast.appendChild(table);
    todayForecast.style.borderBottom = "1px solid black";
}

const validateCity = () => {
    let city = document.getElementById("city_name").value;
    if(city != ""){
        city = city.toLowerCase();
        city = city[0].toUpperCase() + city.slice(1);
        document.getElementById("city_name").value = "";
        fetchWeatherData(city);
    } else alert("Oops! Enter a City First.");
}