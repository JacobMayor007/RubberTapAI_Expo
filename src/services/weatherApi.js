
const API_KEY = "823e9957b5b8485f95b45426250208";
const BASE_URL = "https://api.weatherapi.com/v1";

 const fetchForecastWeather = async (city) => {

  try {
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=7`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
};

const currentWeather = async (city) => {
  try {
    const response = await fetch(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}`)

     if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json()

    console.log(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}`);
    
    return data;

  } catch (error) {
    console.error("Error fetching current weather", error);
    throw error;
  }
}

export { currentWeather, fetchForecastWeather };

