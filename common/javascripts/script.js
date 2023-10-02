var apiKey = "e01f4a7a625fdc5f6318311acbe20b62";
var locLatitude;
var locLongitude;
var requestURL;
var iconURL = "http://openweathermap.org/img/w/";

function init() 
{
    //set the current date
    populateField(".current-date", dayjs().format("dddd, MMMM D, YYYY"))
    //get the users current location
    navigator.geolocation.getCurrentPosition(success);
    
}

//Pass local latitude and longitude to api to get the current weather.
function success(pos) 
{
  const crd = pos.coords;
  getCurrentWeather(crd.latitude, crd.longitude)
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
            populateField(".city", weatherData.name);
            populateField(".temperature", "Temp: " + Math.round(weatherData.main.temp) + "\xB0F");
            populateField(".humidity", "Humidity: " + weatherData.main.humidity + "%");
            populateField(".wind", "Wind: " + weatherData.wind.speed + " MPH");
            document.getElementById("weather-icon").src = iconURL + weatherData.weather[0].icon + ".png";
        });
            
};

//common function to set the value of html fields so the call to set the fields is easier to read and there aren't a million "$" everywhere
function populateField(field, value) {
     $(field).text(value);

}

function getLatitudeAndLongitude() {
    var inputCity = $("#city").val().replace(" ", "_");
    var requestLatLongURL = `http://api.openweathermap.org/geo/1.0/direct?q=${inputCity}&appid=${apiKey}`
    
    fetch(requestLatLongURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            locLatitude = data[0].lat;
            locLongitude = data[0].lon;
          //  console.log(locLatitude + ', ' + locLongitude);
            //if there is time do a case for more than one record being returned.
            //Loop over the data to generate a table, each table row will have a link to the repo url
            // for (var i = 0; i < data.length; i++) {
            
            //     link.textContent = data[i].html_url;
            //     link.href = data[i].html_url;

            // }
            var requestURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${locLatitude}&lon=${locLongitude}&appid=${apiKey}`;
        console.log(requestURL);
    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (weatherData) {
            console.log(weatherData.city.name);
            //if there is time do a case for more than one record being returned.
            //Loop over the data to generate a table, each table row will have a link to the repo url
            var currentDate = dayjs().format("MM/DD/YYYY");
            var currentHour = parseInt(dayjs().format("H"));
            var recDate;
            var recHour;
            for (var i = 0; i < weatherData.list.length; i++) {
                recDate = dayjs(weatherData.list[i].dt_txt).format("MM/DD/YYYY");
                recHour = parseInt(dayjs(weatherData.list[i].dt_txt).format("H"));
                console.log(recDate + " " + currentDate);
                
                if (currentDate == recDate)
                {
                    if (currentHour > recHour)
                    {
                        console.log("yep");
                    }
                }

                //link.textContent = data[i].html_url;
                //link.href = data[i].html_url;

            }
            $(".city").text(weatherData.city.name);
            //document.querySelector(".weather-icon").setAttribute("src", 'http://openweathermap.org/img/w/' + weatherData.weather[0].icon + '.png')
            //var image = $('<img class="imgsize">').attr('src', 'http://openweathermap.org/img/w/' + response.weather[0].icon + '.png');   
        });
        });

        
}

function getWeather() {

    var requestURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${locLatitude}&lon=${locLongitude}&appid=${apiKey}`;

    fetch(requestURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            console.log(data[0].cod);
            //if there is time do a case for more than one record being returned.
            //Loop over the data to generate a table, each table row will have a link to the repo url
            // for (var i = 0; i < data.length; i++) {
            
            //     link.textContent = data[i].html_url;
            //     link.href = data[i].html_url;

            // }
        });
}
$(document).on("click", "#searchbtn", function (event) {
    getLatitudeAndLongitude();
    event.preventDefault();
});

init();