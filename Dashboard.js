
const API_KEY = '031bb10685bdb53d0b947e5eb8bc5c5e';
 let forecastData = [];
 let currentPage = 1;
 let barChart, doughnutChart, lineChart;
 let currentUnit = 'metric'; // Default to Celsius (metric system)

 function getLocation() {
     if (navigator.geolocation) {
         navigator.geolocation.getCurrentPosition(showPosition, showError);
     } else {
         alert('Geolocation is not supported by this browser.');
     }
 }

 function showPosition(position) {
     const lat = position.coords.latitude;
     const lon = position.coords.longitude;
     fetchWeatherAndForecastByCoords(lat, lon);
 }

 function showError(error) {
     switch (error.code) {
         case error.PERMISSION_DENIED:
             alert("User denied the request for Geolocation.");
             break;
         case error.POSITION_UNAVAILABLE:
             alert("Location information is unavailable.");
             break;
         case error.TIMEOUT:
             alert("The request to get user location timed out.");
             break;
         case error.UNKNOWN_ERROR:
             alert("An unknown error occurred.");
             break;
     }
 }

 let isCelsius = true; // Toggle state

 // Function to toggle between Celsius and Fahrenheit
 function toggleUnits() {
     const unitSelect = document.getElementById('unitSelect');
     currentUnit = unitSelect.value;
     getWeather(); // Re-fetch weather data in the new unit system
 }

 // Function to convert temperature based on selected unit
 function convertTemperature(temp) {
     if (isCelsius) {
         return temp; // Celsius, no conversion needed
     } else {
         return (temp * 9/5) + 32; // Convert to Fahrenheit
     }
 }



 function getWeather() {
const city = document.getElementById('cityInput').value;
const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${currentUnit}`;
const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${currentUnit}`;

let currentWeather;

// Fetch current weather first
fetch(currentWeatherUrl)
 .then(response => {
     if (!response.ok) throw new Error('City not found');
     return response.json();
 })
 .then(data => {
     currentWeather = data;
     updateWeatherWidget(data);
     // After successfully getting current weather, fetch forecast
     return fetch(forecastUrl);
 })
 .then(response => {
     if (!response.ok) throw new Error('Failed to fetch forecast');
     return response.json();
 })
 .then(data => {
     // Combine current weather with forecast data
     const currentCondition = {
         dt: currentWeather.dt,
         main: currentWeather.main,
         weather: currentWeather.weather
     };
     
     // Add current weather to the beginning of the forecast data
     forecastData = [currentCondition, ...data.list];
     destroyCharts();
     updateCharts();
 })
 .catch(error => {
     alert(`Error: ${error.message}`);
 });
}

 function updateWeatherWidget(data) {
     const widget = document.getElementById('weatherWidget');
     const weatherCondition = data.weather[0].main.toLowerCase();
     widget.style.backgroundImage = `url('/api/placeholder/800/400?text=${weatherCondition}')`;

     const temp = convertTemperature(data.main.temp); // Convert based on the unit
     const tempUnit = isCelsius ? '°C' : '°F'; // Display the unit dynamically

     widget.innerHTML = `
         <h2>${data.name}</h2>
         <p>Temperature: ${temp}${tempUnit}</p>
         <p>Humidity: ${data.main.humidity}%</p>
         <p>Wind Speed: ${data.wind.speed} m/s</p>
         <p>Weather: ${data.weather[0].description}</p>
     `;

     anime({
         targets: widget,
         opacity: [0, 1],
         translateY: [50, 0],
         duration: 1000,
         easing: 'easeOutElastic(1, .8)'
     });
 }

 function fetchWeatherAndForecastByCoords(lat, lon) {
     const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
     const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

     $.getJSON(currentWeatherUrl, function(data) {
         document.getElementById('cityInput').value = data.name;
         updateWeatherWidget(data);
     }).fail(function() {
         alert('Error: Unable to fetch weather data for current location.');
     });

     $.getJSON(forecastUrl, function(data) {
         forecastData = data.list;
         destroyCharts();  // Destroy the existing charts before updating
         updateCharts();   // Update charts with new data
         updateForecastTable();
     }).fail(function() {
         alert('Error: Unable to fetch forecast data.');
     });
 }


 function updateWeatherWidget(data) {
     const widget = document.getElementById('weatherWidget');
     const weatherCondition = data.weather[0].main.toLowerCase();
     widget.style.backgroundImage = `url('/api/placeholder/800/400?text=${weatherCondition}')`;

     const tempUnit = currentUnit === 'metric' ? '°C' : '°F';

     widget.innerHTML = `
         <h2>${data.name}</h2>
         <p>Temperature: ${data.main.temp}${tempUnit}</p>
         <p>Humidity: ${data.main.humidity}%</p>
         <p>Wind Speed: ${data.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}</p>
         <p>Weather: ${data.weather[0].description}</p>
     `;
     anime({
         targets: widget,
         opacity: [0, 1],
         translateY: [50, 0],
         duration: 1000,
         easing: 'easeOutElastic(1, .8)'
     });
 }

 function updateCharts() {
     updateTemperatureBarChart();
     updateConditionsDoughnutChart();
     updateTemperatureLineChart();
 }

 function destroyCharts() {
     if (barChart) barChart.destroy();
     if (doughnutChart) doughnutChart.destroy();
     if (lineChart) lineChart.destroy();
 }

 function updateTemperatureBarChart() {
     const ctx = document.getElementById('temperatureBarChart').getContext('2d');
     const temperatures = forecastData.slice(0, 5).map(item => item.main.temp);
     const labels = forecastData.slice(0, 5).map(item => new Date(item.dt * 1000).toLocaleDateString());
     
     const tempUnit = currentUnit === 'metric' ? '°C' : '°F';

     barChart = new Chart(ctx, {
         type: 'bar',
         data: {
             labels: labels,
             datasets: [{
                 label: `Temperature (${tempUnit})`,
                 data: temperatures,
                 backgroundColor: 'rgba(75, 192, 192, 0.5)',
                 borderColor: 'rgba(75, 192, 192, 1)',
                 borderWidth: 1
             }]
         },
         options: {
             responsive: true,
             maintainAspectRatio: false,
             plugins: {
                 legend: {
                     labels: { color: 'white' }
                 },
                 title: {
                     display: true,
                     text: `5 Days Temperature Bar Chart (${tempUnit})`,
                     color: 'white',
                     font: { size: 18 }
                 }
             },
             scales: {
                 y: { ticks: { color: 'white' } },
                 x: { ticks: { color: 'white' } }
             }
         }
     });
 }


 function updateConditionsDoughnutChart() {
const ctx = document.getElementById('conditionsChart').getContext('2d');

// Take only unique weather conditions from the forecast
const uniqueConditions = new Set();
const conditionCounts = {};

// Process first 40 data points (5 days of forecast)
forecastData.slice(0, 40).forEach(item => {
 const condition = item.weather[0].main;
 uniqueConditions.add(condition);
 conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
});

// Weather condition colors with opacity
const weatherColors = {
 'Clear': 'rgba(255, 223, 0, 0.8)',      // Bright yellow
 'Clouds': 'rgba(169, 169, 169, 0.8)',   // Gray
 'Rain': 'rgba(0, 0, 255, 0.8)',         // Blue
 'Thunderstorm': 'rgba(255, 0, 0, 0.8)', // Red
 'Snow': 'rgba(255, 250, 250, 0.8)',     // White
 'Drizzle': 'rgba(0, 191, 255, 0.8)',    // Light blue
 'Mist': 'rgba(192, 192, 192, 0.8)',     // Light gray
 'Fog': 'rgba(128, 128, 128, 0.8)'       // Dark gray
};

// Sort conditions by frequency
const sortedConditions = Object.entries(conditionCounts)
 .sort((a, b) => b[1] - a[1])
 .reduce((acc, [key, value]) => {
     acc[key] = value;
     return acc;
 }, {});

if (doughnutChart) {
 doughnutChart.destroy();
}

doughnutChart = new Chart(ctx, {
 type: 'doughnut',
 data: {
     labels: Object.keys(sortedConditions),
     datasets: [{
         data: Object.values(sortedConditions),
         backgroundColor: Object.keys(sortedConditions).map(condition => 
             weatherColors[condition] || 'rgba(128, 128, 128, 0.8)'
         ),
         borderWidth: 2,
         borderColor: 'rgba(255, 255, 255, 0.1)'
     }]
 },
 options: {
     responsive: true,
     maintainAspectRatio: false,
     animation: {
         animateRotate: true,
         animateScale: true,
         duration: 1000,
         easing: 'easeInOutQuart'
     },
     plugins: {
         legend: {
             position: 'right',
             labels: {
                 color: 'white',
                 font: { size: 12 },
                 padding: 20
             }
         },
         title: {
             display: true,
             text: '5 Days Weather Distribution',
             color: 'white',
             font: { size: 18, weight: 'bold' },
             padding: { bottom: 20 }
         },
         tooltip: {
             callbacks: {
                 label: function(context) {
                     const label = context.label || '';
                     const value = context.raw || 0;
                     const total = Object.values(sortedConditions).reduce((a, b) => a + b, 0);
                     const percentage = ((value / total) * 100).toFixed(1);
                     return `${label}: ${value} times (${percentage}%)`;
                 }
             },
             backgroundColor: 'rgba(0, 0, 0, 0.8)',
             padding: 12
         }
     }
 }
});
}


 function updateTemperatureLineChart() {
     const ctx = document.getElementById('temperatureLineChart').getContext('2d');
     const temperatures = forecastData.slice(0, 5).map(item => item.main.temp);
     const labels = forecastData.slice(0, 5).map(item => new Date(item.dt * 1000).toLocaleDateString());
     
     const tempUnit = currentUnit === 'metric' ? '°C' : '°F';

     lineChart = new Chart(ctx, {
         type: 'line',
         data: {
             labels: labels,
             datasets: [{
                 label: `Temperature (${tempUnit})`,
                 data: temperatures,
                 borderColor: 'rgba(255, 159, 64, 1)',
                 backgroundColor: 'rgba(255, 159, 64, 0.2)',
                 borderWidth: 2,
                 fill: true
             }]
         },
         options: {
             responsive: true,
             plugins: {
                 legend: {
                     labels: { color: 'white' }
                 },
                 title: {
                     display: true,
                     text: `5 Days Temperature Line Chart (${tempUnit})`,
                     color: 'white',
                     font: { size: 18 }
                 }
             },
             scales: {
                 y: { ticks: { color: 'white' } },
                 x: { ticks: { color: 'white' } }
             }
         }
     });
 }


 function updateForecastTable() {
     const forecastTableContainer = document.getElementById('forecastTableContainer');
     const tableHTML = `
         <table class="forecast-table">
             <thead>
                 <tr>
                     <th>Date</th>
                     <th>Temperature</th>
                     <th>Condition</th>
                 </tr>
             </thead>
             <tbody>
                 ${forecastData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map(item => `
                     <tr>
                         <td>${new Date(item.dt * 1000).toLocaleString()}</td>
                         <td>${item.main.temp}°C</td>
                         <td>${item.weather[0].description}</td>
                     </tr>
                 `).join('')}
             </tbody>
         </table>
     `;
     forecastTableContainer.innerHTML = tableHTML;
 }
         

 function updateWeatherWidget(data) {
     const widget = document.getElementById('weatherWidget');
     const weatherCondition = data.weather[0].main.toLowerCase();
     widget.style.backgroundImage = `url('/api/placeholder/800/400?text=${weatherCondition}')`;

     const tempUnit = currentUnit === 'metric' ? '°C' : '°F';

     widget.innerHTML = `
         <h2>${data.name}</h2>
         <p>Temperature: ${data.main.temp}${tempUnit}</p>
         <p>Humidity: ${data.main.humidity}%</p>
         <p>Wind Speed: ${data.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}</p>
         <p>Weather: ${data.weather[0].description}</p>
     `;
     anime({
         targets: widget,
         opacity: [0, 1],
         translateY: [50, 0],
         duration: 1000,
         easing: 'easeOutElastic(1, .8)'
     });

     // Call the new function to update the background
     updateBackgroundGradient(weatherCondition);
 }

 function updateBackgroundGradient(weatherCondition) {
     let gradientColors;
     switch (weatherCondition) {
     case 'clear':
         gradientColors = ['#140000', '#4e310b'];
         break;
     case 'clouds':
         gradientColors = ['#0A0A0A', '#B3B3B3'];
         break;
     case 'rain':
         gradientColors = ['#0F0F0F', '#242424'];
         break;
     case 'thunderstorm':
         gradientColors = ['#0F0F0F', '#242424'];
         break;
     case 'snow':
         gradientColors = ['#0A0A0A', '#C7C5EA'];
         break;
     case 'fog':
         gradientColors = ['#050505', '#8A8A8A'];
         break;
     default:
         gradientColors = ['#140000', '#4e310b'];
     }

     document.body.style.background = `linear-gradient(135deg, ${gradientColors[0]}, ${gradientColors[1]})`;
 }
 const weatherColors = {
     'clear': {
         primary: '#fd9813',
         secondary: '#693c00',
         gradient: ['#140000', '#4e310b']
     },
     'clouds': {
         primary: '#B3B3B3',
         secondary: '#4A4A4A',
         gradient: ['#0A0A0A', '#B3B3B3']
     },
     'rain': {
         primary: '#4A90E2',
         secondary: '#2171B5',
         gradient: ['#0F0F0F', '#242424']
     },
     'thunderstorm': {
         primary: '#FFD700',
         secondary: '#4A4A4A',
         gradient: ['#0F0F0F', '#242424']
     },
     'snow': {
         primary: '#E8E8E8',
         secondary: '#A1A1A1',
         gradient: ['#0A0A0A', '#C7C5EA']
     },
     'fog': {
         primary: '#B8B8B8',
         secondary: '#6B6B6B',
         gradient: ['#050505', '#8A8A8A']
     },
     'default': {
         primary: '#fd9813',
         secondary: '#693c00',
         gradient: ['#140000', '#4e310b']
     }
 };

 // Update the updateBackgroundGradient function
 function updateBackgroundGradient(weatherCondition) {
     // If weather is clear or default, keep original colors
     if (weatherCondition === 'clear') {
         // Reset to default colors
         document.body.style.background = `linear-gradient(135deg, #140000, #4e310b)`;
         document.querySelector('.logo-text').style.color = '#fd9813';
         
         const buttons = document.querySelectorAll('.sidebar-button');
         const unitSelect = document.getElementById('unitSelect');
         const searchButton = document.querySelector('.search-container button');
         
         buttons.forEach(button => {
             button.style.backgroundColor = '#693c00';
         });
         
         unitSelect.style.backgroundColor = '#693c00';
         if (searchButton) {
             searchButton.style.backgroundColor = '#693c00';
         }
         return;
     }

     // For other weather conditions, use the weather-specific colors
     const colors = weatherColors[weatherCondition] || weatherColors.default;
     
     // Update background gradient
     document.body.style.background = `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`;
     
     // Update logo text color
     document.querySelector('.logo-text').style.color = colors.primary;
     
     // Update buttons and select background color
     const buttons = document.querySelectorAll('.sidebar-button');
     const unitSelect = document.getElementById('unitSelect');
     
     buttons.forEach(button => {
         button.style.backgroundColor = colors.secondary;
     });
     
     unitSelect.style.backgroundColor = colors.secondary;
     
     // Update search button color
     const searchButton = document.querySelector('.search-container button');
     if (searchButton) {
         searchButton.style.backgroundColor = colors.secondary;
     }
 }
 window.onload = function() {
     getLocation();
 }
