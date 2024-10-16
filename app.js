// Constants
const API_KEY = '031bb10685bdb53d0b947e5eb8bc5c5e'; // Replace with your actual OpenWeather API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEMINI_API_BASE_URL = 'https://api.gemini.com/v1'; // Replace this with the correct Gemini API endpoint

let forecastData = [];

// Variables to hold chart instances
let tempChartInstance = null;
let conditionChartInstance = null;
let forecastChartInstance = null;

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeatherSection = document.getElementById('currentWeather');
const chartsSection = document.getElementById('charts');
const chatInput = document.getElementById('chatInput');
const sendChat = document.getElementById('sendChat');
const chatOutput = document.getElementById('chatOutput');

// Event Listener for manual search
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherData(city);
    }
});

// Automatically fetch weather and forecast based on current location when the page loads
document.addEventListener('DOMContentLoaded', getUserLocation);

// Fetch weather data by city or coordinates
async function fetchWeatherData(location, isCoords = false) {
    try {
        const [currentWeather, forecast] = await Promise.all([
            fetchCurrentWeather(location, isCoords),
            fetchForecast(location, isCoords)
        ]);

        if (currentWeather) updateCurrentWeather(currentWeather);
        if (forecast) {
            forecastData = forecast.list;
            destroyExistingCharts();
            createCharts();
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        currentWeatherSection.innerHTML = `<p>Error: ${error.message}. Please try again.</p>`;
        chartsSection.innerHTML = `<p>Error: ${error.message}. Please try again.</p>`;
    }
}

// Function to get the user's current location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => fetchWeatherData(`${coords.latitude},${coords.longitude}`, true),
            () => fetchWeatherData("Islamabad")
        );
    } else {
        fetchWeatherData("Islamabad");
    }
}

// Fetch current weather and forecast data
async function fetchCurrentWeather(location, isCoords = false) {
    const endpoint = isCoords ? `lat=${location.split(',')[0]}&lon=${location.split(',')[1]}` : `q=${location}`;
    const response = await fetch(`${API_BASE_URL}/weather?${endpoint}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('City not found');
    return await response.json();
}

async function fetchForecast(location, isCoords = false) {
    const endpoint = isCoords ? `lat=${location.split(',')[0]}&lon=${location.split(',')[1]}` : `q=${location}`;
    const response = await fetch(`${API_BASE_URL}/forecast?${endpoint}&appid=${API_KEY}&units=metric`);
    if (!response.ok) throw new Error('Forecast data not available');
    return await response.json();
}

// Function to update the current weather widget
function updateCurrentWeather(data) {
    currentWeatherSection.innerHTML = `
        <h2>${data.name}</h2>
        <p>Temperature: ${data.main.temp.toFixed(1)}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind Speed: ${data.wind.speed.toFixed(1)} m/s</p>
        <p>Weather: ${data.weather[0].description}</p>
        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
    `;
}

// Destroy existing charts before creating new ones
function destroyExistingCharts() {
    [tempChartInstance, conditionChartInstance, forecastChartInstance].forEach(chart => {
        if (chart) chart.destroy();
    });
}

// Create the temperature, condition, and forecast charts
function createCharts() {
    if (forecastData.length > 0) {
        createTemperatureChart();
        createConditionChart();
        createForecastChart();
    } else {
        console.error("No forecast data available for charts.");
    }
}

function createTemperatureChart() {
    const ctx = document.getElementById('tempChart').getContext('2d');
    const labels = forecastData.slice(0, 5).map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = forecastData.slice(0, 5).map(item => item.main.temp);

    tempChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                pointBackgroundColor: '#FFD700',
            }]
        },
        options: chartOptions('5-Day Temperature Forecast')
    });
}

function createConditionChart() {
    const ctx = document.getElementById('conditionChart').getContext('2d');
    const conditions = forecastData.slice(0, 5).map(item => item.weather[0].main);
    const conditionCounts = conditions.reduce((acc, condition) => {
        acc[condition] = (acc[condition] || 0) + 1;
        return acc;
    }, {});
    const backgroundColors = Object.keys(conditionCounts).map(condition => {
        return condition === "Clear" ? 'rgba(0, 255, 0, 0.6)' : 'rgba(153, 102, 255, 0.6)';
    });

    conditionChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(conditionCounts),
            datasets: [{
                data: Object.values(conditionCounts),
                backgroundColor: backgroundColors
            }]
        },
        options: chartOptions('Weather Conditions Distribution', 'doughnut')
    });
}

function createForecastChart() {
    const ctx = document.getElementById('forecastChart').getContext('2d');
    const labels = forecastData.map(item => new Date(item.dt * 1000).toLocaleDateString());
    const temperatures = forecastData.map(item => item.main.temp);

    forecastChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Daily Temperature (°C)',
                data: temperatures,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            }]
        },
        options: chartOptions('7-Day Weather Forecast', 'bar')
    });
}

function chartOptions(titleText, type = 'line') {
    return {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: type === 'bar',
                ticks: { color: '#2d2d2d' },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            },
            x: {
                ticks: { color: '#2d2d2d' },
                grid: { color: 'rgba(0, 0, 0, 0.05)' }
            }
        },
        plugins: {
            legend: { labels: { color: '#2d2d2d' } },
            title: {
                display: true,
                text: titleText,
                color: '#2d2d2d'
            }
        }
    };
}

// Chatbot Functionality
sendChat.addEventListener('click', async () => {
    const userQuery = chatInput.value.trim();
    if (userQuery) {
        chatOutput.innerHTML += `<div>User: ${userQuery}</div>`;
        if (userQuery.toLowerCase().includes("gemini")) {
            const cryptoSymbol = userQuery.replace("gemini", "").trim();
            const geminiResponse = await getGeminiInfo(cryptoSymbol);
            chatOutput.innerHTML += `<div>Bot: ${geminiResponse}</div>`;
        } else {
            const botResponse = await getWeatherInfo(userQuery);
            chatOutput.innerHTML += `<div>Bot: ${botResponse}</div>`;
        }
        chatInput.value = ''; // Clear input after sending
    }
});

// Function to get cryptocurrency info from Gemini API
async function getGeminiInfo(cryptoSymbol) {
    try {
        const response = await fetch(`${GEMINI_API_BASE_URL}/pubticker/${cryptoSymbol}`);
        if (response.ok) {
            const data = await response.json();
            return `${cryptoSymbol.toUpperCase()} Price: $${data.last}`;
        } else {
            return `Sorry, I couldn't find the price for ${cryptoSymbol.toUpperCase()}.`;
        }
    } catch (error) {
        console.error('Error fetching Gemini data:', error);
        return "Error fetching cryptocurrency data. Please try again.";
    }
}

// Function for handling user chat about weather
async function getWeatherInfo(city) {
    try {
        const weatherData = await fetchCurrentWeather(city);
        return `The current weather in ${city} is ${weatherData.main.temp}°C with ${weatherData.weather[0].description}.`;
    } catch (error) {
        return `Sorry, I couldn't fetch the weather for ${city}.`;
    }
}
