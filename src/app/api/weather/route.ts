import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const date = searchParams.get("date"); // ISO date string

    if (!lat || !lng || !date) {
      return NextResponse.json(
        { error: "lat, lng, and date are required" },
        { status: 400 }
      );
    }

    // Use OpenWeatherMap Historical API or similar
    // For now, we'll use OpenWeatherMap One Call API 3.0 (requires subscription)
    // Or we can use a free alternative like Open-Meteo
    
    const apiKey = process.env.OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      // Fallback: Use Open-Meteo (free, no API key needed)
      const dateObj = new Date(date);
      const dateStr = dateObj.toISOString().split("T")[0];
      
      // Open-Meteo Historical Weather API
      const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${dateStr}&end_date=${dateStr}&hourly=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to fetch weather data");
      }

      // Extract weather data for the specific time
      const hourly = data.hourly;
      
      // Get the hour from the date string
      const targetHour = dateObj.getHours();
      let hourIndex = 12; // Default to noon
      
      // Ensure hourIndex is within bounds
      if (hourly.time && hourly.time.length > 0) {
        // Find the closest hour in the hourly data
        const times = hourly.time as string[];
        const closestIndex = times.findIndex((time) => {
          const timeDate = new Date(time);
          return timeDate.getHours() === targetHour;
        });
        hourIndex = closestIndex >= 0 ? closestIndex : 12; // Default to noon if not found
      }
      
      // Ensure we have valid data
      if (!hourly.temperature_2m || !hourly.temperature_2m[hourIndex]) {
        hourIndex = 0; // Fallback to first hour if data is missing
      }
      
      const weatherCode = hourly.weather_code?.[hourIndex] || 0;
      const conditionMap: Record<number, string> = {
        0: "Clear",
        1: "Mostly Clear",
        2: "Partly Cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing Rime Fog",
        51: "Light Drizzle",
        53: "Moderate Drizzle",
        55: "Dense Drizzle",
        61: "Slight Rain",
        63: "Moderate Rain",
        65: "Heavy Rain",
        71: "Slight Snow",
        73: "Moderate Snow",
        75: "Heavy Snow",
        77: "Snow Grains",
        80: "Slight Rain Showers",
        81: "Moderate Rain Showers",
        82: "Violent Rain Showers",
        85: "Slight Snow Showers",
        86: "Heavy Snow Showers",
        95: "Thunderstorm",
        96: "Thunderstorm with Hail",
        99: "Thunderstorm with Heavy Hail",
      };

      const weather: any = {
        temperature: hourly.temperature_2m?.[hourIndex] || 0,
        condition: conditionMap[weatherCode] || "Unknown",
        humidity: hourly.relative_humidity_2m?.[hourIndex] || 0,
        windSpeed: hourly.wind_speed_10m?.[hourIndex] || 0,
        precipitation: hourly.precipitation?.[hourIndex] || 0,
        description: conditionMap[weatherCode] || "Unknown conditions",
      };

      return NextResponse.json(weather);
    }

    // If OpenWeatherMap API key is available, use it
    // (Implementation would go here)

    return NextResponse.json({ error: "Weather API not configured" }, { status: 500 });
  } catch (error: any) {
    console.error("Error fetching weather:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch weather data" },
      { status: 500 }
    );
  }
}

