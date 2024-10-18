// Assume API_KEY for AI API and WEATHER_API_KEY for weather API are globally defined 
const API_KEY = 'AIzaSyAe6d1ZbuP6OFY17CbkE516IxeuK_0_XIc'; // Replace with your actual Gemini API key
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Function to send the message, either fetching AI response or weather
function sendMessage() {
    const userInput = document.getElementById('chatInput').value;

    if (!userInput.trim()) return;  // Prevent empty messages

    appendMessage('user', userInput);  // Append user message to the chat

    if (userInput.toLowerCase().includes("weather") || userInput.toLowerCase().includes("forecast")) {
        const cityMatch = userInput.match(/in\s([a-zA-Z\s]+)/i); // Extract city name
        if (cityMatch && cityMatch[1]) {
            const city = cityMatch[1].trim();
            getWeatherForChat(city); // Fetch weather for the specified city
        } else {
            appendMessage('bot', "Please specify a city, e.g., 'What's the weather in London?'");
        }
    } else {
        fetchAIResponse(userInput).then(response => {
            appendMessage('bot', response);
        }).catch(() => {
            appendMessage('bot', "Sorry, I couldn't process your request.");
        });
    }

    document.getElementById('chatInput').value = ''; // Clear input after sending
}

// Function to fetch AI response from API
async function fetchAIResponse(userInput) {
    if (!userInput || userInput.trim() === '') {
        return 'Error: Input cannot be empty.';
    }

    const requestBody = {
        contents: [{
            parts: [{
                text: userInput
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 150,
        }
    };

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Get detailed error info
            console.error(`Error: Failed to fetch response. Status: ${response.status}`, errorData);
            return `Error: Failed to fetch response. Status: ${response.status}`;
        }

        const data = await response.json();

        if (data && data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
            return data.candidates[0].content.parts[0].text.trim();
        } else {
            return 'Error: No content generated.';
        }
    } catch (error) {
        console.error('Error:', error);
        return 'Error: Unable to fetch response from the API.';
    }
}

// Function to fetch weather information for the specified city
function getWeatherForChat(city) {
    const WEATHER_API_KEY = '031bb10685bdb53d0b947e5eb8bc5c5e'; // Replace with your actual OpenWeather API key
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;

    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            const forecast = data.list[0];
            const weatherDescription = forecast.weather[0].description;
            const temperature = forecast.main.temp.toFixed(1);
            const humidity = forecast.main.humidity;
            const windSpeed = forecast.wind.speed.toFixed(1);

            const message = `The weather in ${city} is currently ${weatherDescription} with a temperature of ${temperature}°C. The humidity is ${humidity}% and the wind speed is ${windSpeed} m/s.`;
            appendMessage('bot', message);
        })
        .catch(() => {
            appendMessage('bot', `Sorry, I couldn't fetch the weather for ${city}. Please check the spelling and try again.`);
        });
}

// Function to append messages to the chat UI
function appendMessage(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);
    messageDiv.textContent = sender === 'user' ? `You: ${message}` : `Bot: ${message}`;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to the latest message

    // Optional: animate the message appearance
    if (typeof anime !== 'undefined') {
        anime({
            targets: messageDiv,
            opacity: [0, 1],
            translateY: [20, 0],
            easing: 'easeOutExpo',
            duration: 500
        });
    }
}