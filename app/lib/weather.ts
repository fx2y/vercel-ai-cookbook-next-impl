import axios from 'axios';

interface WeatherResponse {
  weather: Array<{
    main: string;
    description: string;
  }>;
  main: {
    temp: number;
  };
  name: string;
}

export interface WeatherResult {
  condition: string;
  temperature: number;
  city: string;
}

export class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getWeather(city: string): Promise<WeatherResult> {
    try {
      const response = await axios.get<WeatherResponse>(this.baseUrl, {
        params: {
          q: city,
          appid: this.apiKey,
          units: 'metric' // Use Celsius by default
        }
      });

      return {
        condition: response.data.weather[0].main.toLowerCase(),
        temperature: Math.round(response.data.main.temp),
        city: response.data.name
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error(`City "${city}" not found`);
      }
      throw new Error('Failed to fetch weather data');
    }
  }
}