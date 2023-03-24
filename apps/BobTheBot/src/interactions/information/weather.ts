import { env } from "node:process";
import { ApplicationCommandOptionType, EmbedBuilder, type ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import { permissionToString, type ChatInputCommand } from "../../utils/index.js";

export const RequiredPerms = {
  bot: [],
  user: [],
} as const;

export const WeatherCommand: ChatInputCommand = {
  name: "weather",
  description: "Returns the weather of a location",
  options: [
    {
      name: "city",
      description: "The city to get the weather of (e.g. London)",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: "hour",
      description: "The hour to get the weather of, in the UTC timezone (e.g. 12)",
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      max_value: 23,
      required: false,
    },
  ],
  default_member_permissions: permissionToString(RequiredPerms.user),
  dm_permission: true,
} as const;

export async function execute(interaction: ChatInputCommandInteraction) {
  const city = interaction.options.getString("city");
  const hour = interaction.options.getInteger("hour");

  const cityAPI = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${env.WEATHER_API_KEY}`
  ).then(async (res) => res.json());

  if (cityAPI[0].name !== city) {
    return interaction.reply({
      content: `:wrench: Unable to find requested city: \`${city}\``,
      ephemeral: true,
    });
  }

  const interpretationCodes: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Slight freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain shower",
    81: "Moderate rain shower",
    82: "Heavy rain shower",
    85: "Light snow shower",
    86: "Heavy snow shower",
    95: "Moderate thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  };

  if (!hour) {
    const weatherData = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${cityAPI[0].lat}&longitude=${cityAPI[0].lon}&current_weather=true&timeformat=unixtime`
    ).then(async (res) => res.json());

    // Example data: https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.120000124&current_weather=true&timeformat=unixtime

    const replyEmbed = new EmbedBuilder()
      .setColor(Color.DiscordEmbedBackground)
      .setTitle(`${city}`)
      .setDescription(`Current weather`)
      .addFields(
        {
          name: "Temperature",
          value: `${weatherData.current_weather.temperature}°C`,
          inline: true,
        },
        {
          name: "Wind speed",
          value: `${weatherData.current_weather.windspeed} km/h`,
          inline: true,
        },
        {
          name: "Wind direction",
          value: `${weatherData.current_weather.winddirection}°`,
          inline: true,
        },
        {
          name: "Weather interpretation",
          value: `${interpretationCodes[weatherData.current_weather.weathercode]}`,
          inline: true,
        }
      )
      .setFooter({
        text: `Powered by OpenMeteo, Generation time: ${weatherData.generationtime_ms.toPrecision(2)}ms`,
      });

    return interaction.reply({ embeds: [replyEmbed] });
  } else if (hour) {
    const weatherData = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${cityAPI[0].lat}&longitude=${cityAPI[0].lon}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,cloudcover,windspeed_10m,winddirection_10m,snowfall,rain,weathercode,visibility&timeformat=unixtime`
    ).then(async (res) => res.json());

    // Example data: https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.120000124&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,cloudcover,windspeed_10m,winddirection_10m,snowfall,rain,weathercode,visibility&timeformat=unixtime

    const userDate = new Date(Date.now());

    userDate.setUTCHours(hour, 0, 0, 0);

    const arrayIndex = weatherData.hourly.time.indexOf(userDate.getTime() / 1_000);

    if (arrayIndex === -1) {
      return interaction.reply({
        content: `:wrench: Unable to find requested hour: \`${hour}\``,
        ephemeral: true,
      });
    }

    const replyEmbed = new EmbedBuilder()
      .setColor(Color.DiscordEmbedBackground)
      .setTitle(`${city}`)
      .setDescription(`Weather at ${hour}:00 UTC`)
      .addFields(
        {
          name: "Temperature",
          value: `${weatherData.hourly.temperature_2m[arrayIndex]}°C`,
          inline: true,
        },
        {
          name: "Wind speed",
          value: `${weatherData.hourly.windspeed_10m[arrayIndex]} km/h`,
          inline: true,
        },
        {
          name: "Wind direction",
          value: `${weatherData.hourly.winddirection_10m[arrayIndex]}°`,
          inline: true,
        },
        {
          name: "Cloud cover",
          value: `${weatherData.hourly.cloudcover[arrayIndex]}%`,
          inline: true,
        },
        {
          name: "Humidity",
          value: `${weatherData.hourly.relativehumidity_2m[arrayIndex]}%`,
          inline: true,
        },
        {
          name: "Visibility",
          value: `${weatherData.hourly.visibility[arrayIndex] / 1_000} km`,
          inline: true,
        },
        {
          name: "Weather interpretation",
          value: `${interpretationCodes[weatherData.hourly.weathercode[arrayIndex]]}`,
          inline: false,
        }
      )
      .setFooter({
        text: `Powered by OpenMeteo, Generation time: ${weatherData.generationtime_ms.toPrecision(2)}ms`,
      });

    return interaction.reply({ embeds: [replyEmbed] });
  }
}
