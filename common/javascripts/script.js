var apiKey = "e01f4a7a625fdc5f6318311acbe20b62";
var locLatitude;
var locLongitude;
var requestURL;
var iconURL = "http://openweathermap.org/img/w/";
var weatherIcon = document.getElementById("weather-icon");
var cityClassName = ".city";
var tempClassName = ".temperature";
var humidityClassName = ".humidity";
var windClassName = ".wind";
var now = moment();
populateField("#currentDay", now.format("dddd, MMMM Do, YYYY"));

function init() 
{
    //get the users current location
    navigator.geolocation.getCurrentPosition(success, showError);
    checkLocalStorage();
}

//Run if the call for the current location is successful.
function success(pos) 
{
  const crd = pos.coords;
  //Pass local latitude and longitude to api to get the current weather.
  getCurrentWeather(crd.latitude, crd.longitude);
  getForecast(crd.latitude, crd.longitude) ;
}

//Run if the call for the current location is unsuccessful.
function showError(error) 
{
    var errMessage = "";

    switch(error.code) 
    {
        case error.PERMISSION_DENIED:
            errMessage = "User denied the request for local location.";
            break;
        case error.POSITION_UNAVAILABLE:
            errMessage = "Location information is unavailable.";
            break;
        case error.TIMEOUT:
            errMessage = "The request to get user location timed out.";
            break;
        default:
            errMessage = "An unknown error occurred.";
            break;
    }

    populateField(cityClassName, errMessage);
    populateField(tempClassName, "");
    populateField(humidityClassName, "Humidity: ");
    populateField(windClassName, "Wind: ");
    weatherIcon.src = "";
}

function getCurrentWeather(lat, lon) 
{
    //URL for current weather based on latitude, longitude, and api key
    requestURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    fetch(requestURL)
        .then(function (response) 
        {
            return response.json();
        })
        .then(function (weatherData) 
        {
            //populate the fields for the current city
            populateField(cityClassName, weatherData.name);
            populateField(tempClassName, Math.round(weatherData.main.temp) + "\xB0F");
            populateField(humidityClassName, "Humidity: " + weatherData.main.humidity + "%");
            populateField(windClassName, "Wind: " + weatherData.wind.speed + " MPH");
            weatherIcon.src = iconURL + weatherData.weather[0].icon + ".png";
        });
}

//common function to set the value of html fields so the call to set the fields is easier to read and there aren't a million "$" everywhere
function populateField(field, value) {
     $(field).text(value);

}

function getLatitudeAndLongitude(city) 
{
    event.preventDefault();
    //URL for api cannot have spaces so replace any spaces in the city name with underscores
    var inputCity = city.replace(" ", "_");
    
    var requestLatLongURL = `http://api.openweathermap.org/geo/1.0/direct?q=${inputCity}&appid=${apiKey}`
    
    fetch(requestLatLongURL)
        .then(function (response) 
        {
            return response.json();
        })
        .then(function (data) 
        {
            locLatitude = data[0].lat;
            locLongitude = data[0].lon;
            getForecast(locLatitude, locLongitude)
        });
}

function getForecast(lat, lon) 
{
    var requestURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    
    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (weatherData) 
        {
            var currentDate = dayjs().format("MM/DD/YYYY");
            var currentDay = parseInt(dayjs().format("D"));
            var recDate;
            var recHour;
            var j = 0;
            var iconEle;
            
            for (var i = 0; i < weatherData.list.length; i++) 
            {
                recDateUnFormat = dayjs(weatherData.list[i].dt_txt);
                recDate = recDateUnFormat.format("MM/DD/YYYY");
                recDay = parseInt(dayjs(weatherData.list[i].dt_txt).format("D"));
               
                if (recDate == currentDate) 
                {
                    //if the data is for the current day, populate the current info section
                    populateField(cityClassName, weatherData.city.name);
                    populateField(tempClassName, Math.round(convertKelvinToFahrenheit(weatherData.list[i].main.temp)) + "\xB0F");
                    populateField(humidityClassName, "Humidity: " + weatherData.list[i].main.humidity + "%");
                    populateField(windClassName, "Wind: " + weatherData.list[i].wind.speed + " MPH");
                    weatherIcon.src = iconURL + weatherData.list[i].weather[0].icon + ".png";
                }
                else if (recDate > currentDate)
                {
                    //if the data is after the current date, populate the forecast info section
                    //each day returns multiple values, i.e. 9am, 12pm, 3pm so we're just going to display the values at noon
                    if (recDateUnFormat.format("hh:mm:ss") == "12:00:00")
                    {
                        //j is the counter used to figure out the html ids
                        //we only display 5 so get only 5 records
                        j = recDay - currentDay;
                        if (j <= 5)
                        {
                            populateField(".day-" + j + "-date", recDate);
                            populateField(".day-" + j + "-temperature", Math.round(convertKelvinToFahrenheit(weatherData.list[i].main.temp)) + "\xB0F");
                            populateField(".day-" + j + "-humidity", "Humidity: " + weatherData.list[i].main.humidity + "%");
                            populateField(".day-" + j + "-wind", "Wind: " + weatherData.list[i].wind.speed + " MPH");
                            iconEle = "day-" + j + "-icon";
                            weatherIcon = document.getElementById(iconEle);
                            weatherIcon.src = iconURL + weatherData.list[i].weather[0].icon + ".png";
                        }
                    }
                }
            }
            $(cityClassName).text(weatherData.city.name);
        });
}

function convertKelvinToFahrenheit(valNum) 
{
    return ((valNum - 273.15) * 1.8) + 32;
}

// Function to get data store in local storage 
function checkLocalStorage() 
{
    //get the data from local storage
    var storedData = localStorage.getItem('Search_Cities');
    var dataArray = [];
    if (storedData) 
    {
        //if there is data in local storage, trim the data then parse it into an array
        storedData.trim();
        dataArray = storedData.split(',');

        //for each city in the array create a search link
        for (var i = 0; i < dataArray.length; i++) {
            createRecentSearchLink(dataArray[i]);
        }
    }
}

// Function to Set data in Local storage
function saveToLocalStorage(city) 
{
    event.preventDefault();
    var data = localStorage.getItem('Search_Cities');
    if (data) 
    {
        //If there is data in local storage check if the just searched for city is already
        //included in that data. If not, add the city to the list.
        if (data.indexOf(city) === -1) 
        {
            data = data + ',' + city;
            localStorage.setItem('Search_Cities', data);
            createRecentSearchLink(city);
        }
    } 
    else 
    {
        //If there is no data in local storage, add it.
        data = city;
        localStorage.setItem('Search_Cities', data);
    }
}

function createRecentSearchLink(city) 
{
    var newLi = $("<li>")
    var newP = $('<p>');
    newP.attr('id', 'pastCity');
    newP.attr("onmouseover", "this.style.textDecoration='underline'")
    newP.attr("onmouseout", "this.style.textDecoration='none'")
    newP.attr("style", "cursor: pointer")
    newP.addClass("searched-cities");
    newP.text(city);
    newLi.append(newP)
    $("#historyList").prepend(newLi);
    $("#pastCity").on("click", function () {
        var newCity = $(this).text();
        getLatitudeAndLongitude(newCity);
    });
}

//Kick off the search
$(document).on("click", "#searchbtn", function (event) 
{
    var searchedCity = $("#city").val();
    if (searchedCity == "")
    {
        alert("Enter a valid city");
    }
    else
    {
        saveToLocalStorage(searchedCity);
        getLatitudeAndLongitude(searchedCity);
        //checkLocalStorage() 
    }
    $("#city").val("");
    event.preventDefault();
});

//added clear histor fuction to clear searched city list
$("#clear-history").on("click", function (event) 
{
    $("#historyList").empty();
    localStorage.setItem('Search_Cities', "");
});

init();