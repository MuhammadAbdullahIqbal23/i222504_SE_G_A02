// Constants
const API_KEY = '031bb10685bdb53d0b947e5eb8bc5c5e'; // Replace with your actual OpenWeather API key
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
let forecastData = [];
const itemsPerPage = 10;
let currentPage = 1;

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const tableBody = document.querySelector('#forecastTable tbody');
const pagination = document.getElementById('pagination');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if (city) {
        getForecast(city);
    }
});

// Fetch Forecast Data
async function getForecast(city) {
    try {
        const response = await fetch(`${API_BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error('City not found');
        }
        const data = await response.json();
        forecastData = data.list;
        updateTable();
        updatePagination();
    } catch (error) {
        console.error('Error fetching forecast:', error);
        tableBody.innerHTML = `<tr><td colspan="3">Error: ${error.message}</td></tr>`;
    }
}

// Update Table with Forecast Data
function updateTable() {
    tableBody.innerHTML = '';
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = forecastData.slice(startIndex, endIndex);

    pageData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(item.dt * 1000).toLocaleDateString()}</td>
            <td>${item.main.temp.toFixed(1)}°C</td>
            <td>${item.weather[0].description}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Pagination
function updatePagination() {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(forecastData.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            updateTable();
        });
        if (i === currentPage) {
            button.classList.add('active');
        }
        pagination.appendChild(button);
    }
}
