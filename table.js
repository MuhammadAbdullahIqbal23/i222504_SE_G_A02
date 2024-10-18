const WEATHER_API_KEY = '031bb10685bdb53d0b947e5eb8bc5c5e';
        const GEMINI_API_KEY = 'AIzaSyAe6d1ZbuP6OFY17CbkE516IxeuK_0_XIc';

        let forecastData = [];
        let currentPage = 1;
        const itemsPerPage = 10;

        document.getElementById('cityInput').addEventListener('input', function() {
            const searchContainer = document.querySelector('.search-container');
            if (this.value) {
                searchContainer.classList.add('active');
            } else {
                searchContainer.classList.remove('active');
            }
        });

        function getWeather() {
            const city = document.getElementById('cityInput').value;
            if (!city) {
                alert('Please enter a city name');
                return;
            }

            showLoading();

            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

            $.getJSON(forecastUrl, data => {
                forecastData = data.list;
                displayForecast();
                showDropdown();
                hideLoading();
            }).fail((jqXHR) => {
                hideLoading();
                if (jqXHR.status === 404) {
                    alert('City not found. Please check the spelling and try again.');
                } else {
                    alert('Error fetching forecast data. Please try again later.');
                }
            });
        }

        function displayForecast() {
            const tableContainer = document.getElementById('forecastTableContainer');
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const currentPageData = forecastData.slice(start, end);

            let tableHTML = '<table class="forecast-table"><thead><tr><th>Date</th><th>Temperature (°C)</th><th>Weather</th><th>Humidity</th><th>Wind Speed (m/s)</th></tr></thead><tbody>';
            currentPageData.forEach(item => {
                const date = new Date(item.dt_txt).toLocaleString();
                const temp = item.main.temp.toFixed(1);
                const weather = item.weather[0].description;
                const humidity = item.main.humidity;
                const windSpeed = item.wind.speed.toFixed(1);
                tableHTML += `<tr><td>${date}</td><td>${temp}</td><td>${weather}</td><td>${humidity}%</td><td>${windSpeed}</td></tr>`;
            });
        tableHTML += '</tbody></table>';

        tableContainer.innerHTML = tableHTML;
        
        anime({
            targets: '.forecast-table',
            opacity: [0, 1],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 800,
            delay: 200
        });
    }

    function showDropdown() {
        const dropdown = document.querySelector('.dropdown');
        dropdown.style.display = 'block';
        anime({
            targets: '.dropdown',
            opacity: [0, 1],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 800
        });
    }

    function nextPage() {
        if ((currentPage * itemsPerPage) < forecastData.length) {
            currentPage++;
            displayForecast();
        }
    }

    function previousPage() {
        if (currentPage > 1) {
            currentPage--;
            displayForecast();
        }
    }

    function handleDropdownChange() {
        const action = document.getElementById('weatherActions').value;
        if (action === 'asc') {
            forecastData.sort((a, b) => a.main.temp - b.main.temp);
        } else if (action === 'desc') {
            forecastData.sort((a, b) => b.main.temp - a.main.temp);
        } else if (action === 'rain') {
            forecastData = forecastData.filter(item => item.weather[0].main.toLowerCase() === 'rain');
        } else if (action === 'hottest') {
            const hottestDay = forecastData.reduce((prev, current) => (prev.main.temp > current.main.temp) ? prev : current);
            forecastData = [hottestDay];
        }
        currentPage = 1;
        displayForecast();
    }

    // function sendMessage() {
    //     const userInput = document.getElementById('chatInput').value;
    //     const chatMessages = document.getElementById('chatMessages');

    //     if (!userInput.trim()) return;

    //     appendMessage('user', userInput);

    //     if (userInput.toLowerCase().includes("weather") || userInput.toLowerCase().includes("forecast")) {
    //         const cityMatch = userInput.match(/in\s([a-zA-Z\s]+)/i);
    //         if (cityMatch && cityMatch[1]) {
    //             const city = cityMatch[1].trim();
    //             getWeatherForChat(city);
    //         } else {
    //             appendMessage('bot', "Please specify a city, e.g., 'What's the weather in London?'.");
    //         }
    //     } else {
    //         // Handle general queries via Gemini API
    //         fetch('https://api.gen-ai.com/chatbot', {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${GEMINI_API_KEY}`,
    //                 'Content-Type': 'application/json'
    //             },
    //             body: JSON.stringify({ query: userInput })
    //         })
    //         .then(response => response.json())
    //         .then(data => {
    //             appendMessage('bot', data.response);
    //         })
    //         .catch(() => {
    //             appendMessage('bot', "Sorry, I couldn't process your request.");
    //         });
    //     }

    //     document.getElementById('chatInput').value = ''; // Clear input
    // }

    function getWeatherForChat(city) {
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

        $.getJSON(forecastUrl, data => {
            const forecast = data.list[0];
            const weatherDescription = forecast.weather[0].description;
            const temperature = forecast.main.temp.toFixed(1);
            const humidity = forecast.main.humidity;
            const windSpeed = forecast.wind.speed.toFixed(1);

            const message = `The weather in ${city} is currently ${weatherDescription} with a temperature of ${temperature}°C. The humidity is ${humidity}% and the wind speed is ${windSpeed} m/s.`;
            appendMessage('bot', message);
        }).fail(() => {
            appendMessage('bot', `Sorry, I couldn't fetch the weather for ${city}. Please check the spelling and try again.`);
        });
    }

    function appendMessage(sender, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', sender);
        messageDiv.textContent = sender === 'user' ? `You: ${message}` : `Bot: ${message}`;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        anime({
            targets: messageDiv,
            opacity: [0, 1],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 500
        });
    }

    function showLoading() {
        document.querySelector('.loading').style.display = 'block';
    }

    function hideLoading() {
        document.querySelector('.loading').style.display = 'none';
    }

    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelector('.dropdown').style.display = 'none';
        
        // Add event listener for Enter key in search input
        document.getElementById('cityInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getWeather();
            }
        });

        // Add event listener for Enter key in chat input
        document.getElementById('chatInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    });