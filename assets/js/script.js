let weatherData;
let cityName = document.getElementById("form-control");
let city = "";
let cities = [];
let cityHistoryBox = document.getElementById("search-history-box");
let apiKey = "";
init();
historyClicked();

function init() {
	let savedCities = JSON.parse(localStorage.getItem("cities"));

	if (savedCities !== null) {
		cities = savedCities;
	}
	displayCityHistory();
}

// Save to local storage the user input of array of strings as a JSON stringify
function cityStorage() {
	localStorage.setItem("cities", JSON.stringify(cities));
}

//Show buttons of each element in the cities array as a search history on left side of page
function displayCityHistory() {
	cityHistoryBox.innerHTML = "";

	if (cities == null) {
		return;
	}
	let userInputCity = [...new Set(cities)];
	for (let i = 0; i < userInputCity.length; i++) {
		let cityNamesHistory = userInputCity[i];

		let cityHistoryButtonEl = document.createElement("button");
		cityHistoryButtonEl.textContent = cityNamesHistory;
		cityHistoryButtonEl.setAttribute("class", "history-list-buttons");
		cityHistoryButtonEl.style.margin = "10px";

		cityHistoryBox.appendChild(cityHistoryButtonEl);

		historyClicked();
	}
}

function historyClicked() {
	$(".history-list-buttons").on("click", function (event) {
		event.preventDefault();
		city = $(this).text().trim();

		weatherApiCalls(city);
	});
}

$("#search-button").on("click", function (event) {
	event.preventDefault();

	city = $(this).prev().val().trim();

	//Push the city the user entered into search bar into the cities array
	cities.push(city);

	//make sure cities array.length is never more than 8
	if (cities.length > 8) {
		cities.shift();
	}
	// if the form is blank return from the function early
	if (city == "") {
		return;
	}

	weatherApiCalls(city);
	displayCityHistory();
	cityStorage();
});

// function calling api twice with fetch for current weather and a 5 day forecast use jquery to display to the html
function weatherApiCalls(cityInput) {
	// console.log('testing', weather);
	// let cityInput = cityName.value()
	apiKey = "2a5a9e3f8873ca8b4f13d2b884564b89";
	let requestUrl =
		"https://api.openweathermap.org/data/2.5/weather?q=" +
		cityInput +
		"&units=imperial&appid=" +
		apiKey;

	fetch(requestUrl)
		.then(function (response) {
			return response.json();
		})
		.then(function (data) {
			// console.log(data)

			let dataName = data.name;
			let dataDate = data.dt * 1000;
			let convertDate = new Date(dataDate);
			let humanDateFormat = convertDate.toLocaleString("en-US", {
				timeZoneName: "short",
			});
			let dataIcon = data.weather[0].icon;
			let dataTemp = data.main.temp;
			let dataHum = data.main.humidity;
			let dataWind = data.wind.speed;

			$("#city").text(dataName);
			$("#today-date").text(humanDateFormat);

			$("#today-weather-icon").attr({
				src: "http://openweathermap.org/img/w/" + dataIcon + ".png",
				height: "100px",
				width: "100px",
			});

			$("#temp").text(
				"Temperature: " + dataTemp + String.fromCharCode(176) + "F"
			);
			$("#hum").text("Humidity: " + dataHum + String.fromCharCode(37));
			$("#wind-speed").text("Wind Speed: " + dataWind + " MPH");

			//second API call for 5 day forecast
			let secondRequestUrl =
				"https://api.openweathermap.org/data/2.5/forecast?q=" +
				cityInput +
				"&units=imperial&appid=" +
				apiKey;
			//  return pulled out not sure if needed//
			return fetch(secondRequestUrl)
				.then(function (response) {
					return response.json();
				})
				.then(function (response) {
					// console.log(response)
					let numberOfDays = 0;

					//iterate over the 40 weather data sets = 5 days x 8 hours per day
					for (let i = 0; i < response.list.length; i++) {
						//split function to isolate the time-data
						if (response.list[i].dt_txt.split(" ")[1] == "15:00:00") {
							//When its 3pm update these fields
							let day = response.list[i].dt_txt.split("-")[2].split(" ")[0];
							let month = response.list[i].dt_txt.split("-")[1];
							let year = response.list[i].dt_txt.split("-")[0];
							$("#" + numberOfDays + "date").text(
								month + "/" + day + "/" + year
							);
							let data5DayTemp = response.list[i].main.temp;
							$("#" + numberOfDays + "temperature").text(
								"Temperature: " + data5DayTemp + String.fromCharCode(176) + "F"
							);
							$("#" + numberOfDays + "humidity").text(
								"Humidity: " +
									response.list[i].main.humidity +
									String.fromCharCode(37)
							);
							$("#" + numberOfDays + "weather-forecast-icon").attr(
								"src",
								"http://openweathermap.org/img/w/" +
									response.list[i].weather[0].icon +
									".png"
							);

							// console.log(response.list[i].dt_txt.split("-"));
							// console.log(numberOfDays);
							// console.log(response.list[i].main.temp);
							// console.log(response.list[i].main.humidity);
							numberOfDays++;
						}
					}
				});
		});
}
