import './styles.css';
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const images = importAll(require.context('./assets', false, /\.(svg)$/));

const searchBox = document.getElementById('city-search');
const searchBtn = document.querySelector('button');

async function getWeatherData() {
    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${searchBox.value}?key=MC7EXZUA9FL9AUQPXUJ2EEN5N`);

        if (!response.ok) {
            throw Error(response.status);
        }

        const weatherData = await response.json();
        console.log(weatherData)

        const formattedData = {};

        // Get location info
        formattedData['city'] = weatherData.address;

        // Get current temp
        formattedData['currentTemp'] = Math.round(weatherData.days[0].temp);

        // Get high temp
        formattedData['highTemp'] = Math.round(weatherData.days[0].tempmax);

        // Get low temp
        formattedData['lowTemp'] = Math.round(weatherData.days[0].tempmin);

        // Get condition
        formattedData['condition'] = weatherData.days[0].icon;

        // Get forcast data
        const forcastData = [];
        for (let index = 2; index < 7; index++) {
            const day = weatherData.days[index];

            // Get the day of the week from the date
            const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const date = new Date(day.datetime);
            const dayIndex = date.getDay();
            const dayStr = weekdays[dayIndex]; 

            const dayObj = {
                'date': dayStr,
                'highTemp': Math.round(day.tempmax),
                'lowTemp': Math.round(day.tempmin),
                'condition': day.icon
            }

            forcastData.push(dayObj);
        }
        formattedData['forcast'] = forcastData;

        return formattedData;

    } catch (error) {
        console.log(error);
    }
}

function displayWeather(weatherData) {
    // Create weather card
    const weatherCard = document.createElement('div');
    weatherCard.classList.add('weather-card');

    // Create location header
    const location = document.createElement('h1');
    location.textContent = weatherData['city'] // TODO: Update with api data
    weatherCard.appendChild(location)

    // Create current temp container
    const currentTempContainer = document.createElement('div');
    currentTempContainer.classList.add('temp-container');
    const currentTemp = document.createElement('p');
    currentTemp.id = 'current-temp';
    currentTemp.textContent = `${weatherData['currentTemp']}°`; // TODO: Update with api data
    currentTempContainer.appendChild(currentTemp);
    const icon = document.createElement('img');
    icon.src = images[`${weatherData['condition']}.svg`];
    currentTempContainer.appendChild(icon);
    weatherCard.appendChild(currentTempContainer);

    // Create high/low container
    const highLowContainer = document.createElement('div');
    highLowContainer.classList.add('high-low');
    const high = document.createElement('p');
    high.textContent = `H: ${weatherData.highTemp}°`;
    highLowContainer.appendChild(high);
    const low = document.createElement('p');
    low.textContent = `L: ${weatherData.lowTemp}°`;
    highLowContainer.appendChild(low);
    weatherCard.appendChild(highLowContainer);

    // Create forcast cards
    const forcastContainer = document.createElement('div');
    forcastContainer.classList.add('forcast-container');
    for (let i = 0; i < weatherData['forcast'].length; i++) {
        const day = weatherData['forcast'][i]
        
        const forcastCard = document.createElement('div');
        forcastCard.classList.add('forcast-card');

        const icon = document.createElement('img');
        icon.src = images[`${day['condition']}.svg`];
        forcastCard.appendChild(icon);

        const highTemp = document.createElement('p');
        highTemp.textContent = `H: ${day['highTemp']}`;
        forcastCard.appendChild(highTemp);

        const lowTemp = document.createElement('p');
        lowTemp.textContent = `L: ${day['lowTemp']}`;
        forcastCard.appendChild(lowTemp);

        forcastContainer.appendChild(forcastCard);
    }
    weatherCard.appendChild(forcastContainer);

    document.body.appendChild(weatherCard);
}

searchBtn.addEventListener('click', async () => {
    if (searchBox.value === '') {
        console.log('Please enter a city');
        return;
    }

    const weatherCard = document.querySelector('.weather-card');
    if (weatherCard) {
        weatherCard.remove();
    }

    // Add Loading indicator
    const loadingIndicatorContainer = document.createElement('div');
    loadingIndicatorContainer.classList.add('weather-card');
    const loadingText = document.createElement('h1');
    loadingText.textContent = 'Loading...';
    loadingIndicatorContainer.appendChild(loadingText);
    document.body.appendChild(loadingIndicatorContainer);
    
    const weatherData = await getWeatherData();

    if (weatherData) {
        displayWeather(weatherData);
    }

    loadingIndicatorContainer.remove();

    searchBox.value = ''
})