(function()
{
	var API_WORLDTIME_KEY = "af6c521c08a030d525358eb3666c2";
	var API_WORLDTIME = "http://api.worldweatheronline.com/free/v2/tz.ashx?format=json&key=" + API_WORLDTIME_KEY + "&q=";
	var API_WEATHER_KEY = "9b756dfed8c0c3967f210fac031b4e45";
	var API_WEATHER_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_WEATHER_KEY + "&";
	var IMG_WEATHER = "http://openweathermap.org/img/w/";

	var today = new Date();
	var timeNow = today.toLocaleTimeString();

	var $body = $("body");
	var $loader = $(".loader");
	var nombreCiudad = $("[data-input = 'cityAdd']");
	var $buttonAdd = $("[data-button = 'add']");
	var buttonLoad = $("[data-saved-cities]");

	var cities = [];//aqui se guardan las ciudades

	var cityWeather = {};
	cityWeather.zone;
	cityWeather.icon;
	cityWeather.temp;
	cityWeather.temp_max;
	cityWeather.temp_min;
	cityWeather.main;

	$( $buttonAdd ).on("click", addNewCity);

	$( nombreCiudad ).on("keypress", function(event)
		{
			//console.log(which)
			if(event.which == 13)
			{
				addNewCity(event);
			}
		}
	);

	$( buttonLoad ).on("click", loadSaveCities);

	//con esto sabemos si el navegador es compatible con geolocalizacion
	if(navigator.geolocation)
	{
		navigator.geolocation.getCurrentPosition(getCoord, errorFound);
	}
	else
	{
		alert("Actualiza tu navegador pinche viejito");
	}

	function errorFound(error)
	{
		alert("Error ocurrido: " + error.code)
		//si regresa un valor:
		//0: Error desconocido
		//1: Permiso denegado
		//2: Posicion no esta disponible
		//3: Timeout
	};

	function getCoord(position)
	{
		var latitud = position.coords.latitude;
		var longitud = position.coords.longitude;
		//alert("Tu position es: " + latitud + ", " + longitud);
		console.log("Tu position es; " + latitud + ", " + longitud);
		$.getJSON(API_WEATHER_URL + "lat=" + latitud + "&lon=" + longitud, getCurrentWeather);
	};

	function getCurrentWeather(data)
	{
		//console.log(data); //asi verificamos que llega al data y de alli desglozamos para obtener todo los datos
		cityWeather.zone = data.name;
		cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
		cityWeather.temp = data.main.temp - 273.15;
		cityWeather.temp_max = data.main.temp_max - 273.15;
		cityWeather.temp_min = data.main.temp_min - 273.15;
		cityWeather.main = data.weather[0].main;

		renderTemplate(cityWeather);
	};

	function activateTemplate(id)
	{
		var t = document.querySelector(id);
		return document.importNode(t.content, true);
	};

	function renderTemplate(cityWeather, localTime)
	{

		var clone = activateTemplate("#template--city");
		var timeToShow;

		if(localTime)
		{
			timeToShow = localTime.split(" ")[1];
		}
		else
		{
			timeToShow = timeNow;
		}

		clone.querySelector("[data-time]").innerHTML = timeToShow;
		clone.querySelector("[data-city]").innerHTML = cityWeather.zone;
		clone.querySelector("[data-icon]").src = cityWeather.icon;
		clone.querySelector("[data-temp = 'max']").innerHTML = cityWeather.temp_max.toFixed(1);
		clone.querySelector("[data-temp = 'min']").innerHTML = cityWeather.temp_min.toFixed(1);
		clone.querySelector("[data-temp = 'current']").innerHTML = cityWeather.temp.toFixed(1);
		
		$( $loader ).hide();
		$( $body ).append(clone);		
	}

	function addNewCity(event)
	{
		event.preventDefault();
		$.getJSON(API_WEATHER_URL + "q=" + $( nombreCiudad ).val(), getTiempoNuevaCiudad);
	}

	function getTiempoNuevaCiudad(data)
	{
		$.getJSON(API_WORLDTIME + $(nombreCiudad).val(), function(respuesta)
			{
				nombreCiudad.val("");
				cityWeather = {};
				cityWeather.zone = data.name;
				cityWeather.icon = IMG_WEATHER + data.weather[0].icon + ".png";
				cityWeather.temp = data.main.temp - 273.15;
				cityWeather.temp_max = data.main.temp_max - 273.15;
				cityWeather.temp_min = data.main.temp_min - 273.15;
				cityWeather.main = data.weather[0].main;

				renderTemplate(cityWeather, respuesta.data.time_zone[0].localtime);

				cities.push(cityWeather);
				localStorage.setItem("cities", JSON.stringify(cities));

			});
		//console.log(data);
	}

	function loadSaveCities(event)
	{
		event.preventDefault();

		function renderCities(cities)
		{
			cities.forEach(function(city)
			{
				renderTemplate(city);
			});
		};

		var cities = JSON.parse(localStorage.getItem("cities"));
		renderCities(cities);

	}


})();
