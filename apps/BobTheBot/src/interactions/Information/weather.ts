import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from "discord.js";
import { Color } from "../../constants.js";
import dotenv from "dotenv";

dotenv.config();

const requiredBotPerms = {
  type: "flags" as const,
  key: [] as const,
};

const requiredUserPerms = {
  type: "flags" as const,
  key: [] as const,
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weather")
    .setDescription("Get the weather of a city")
    .addStringOption((option) =>
      option.setName("city").setDescription("The city you want to get the weather of (Ex: London)").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("hour")
        .setDescription("The hour you want to get the weather of in UTC timezone (Ex: 12, 18, 6)")
        .setMinValue(0)
        .setMaxValue(23)
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction<"cached">) {
    const city = interaction.options.getString("city");
    const hour = interaction.options.getInteger("hour");

    const cityAPI = await fetch(
      `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${process.env.WEATHER_API_KEY}`
    ).then((res) => res.json());

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
      ).then((res) => res.json());

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

      return await interaction.reply({ embeds: [replyEmbed] });
    } else {
      const weatherData = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${cityAPI[0].lat}&longitude=${cityAPI[0].lon}&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,cloudcover,windspeed_10m,winddirection_10m,snowfall,rain,weathercode,visibility&timeformat=unixtime`
      ).then((res) => res.json());

      // Example data: https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.120000124&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,cloudcover,windspeed_10m,winddirection_10m,snowfall,rain,weathercode,visibility&timeformat=unixtime

      let userDate = new Date(Date.now());

      userDate.setUTCHours(hour, 0, 0, 0);

      const arrayIndex = weatherData.hourly.time.indexOf(userDate.getTime() / 1000);

      if (arrayIndex == -1) {
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
            value: `${weatherData.hourly.visibility[arrayIndex] / 1000} km`,
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

      return await interaction.reply({ embeds: [replyEmbed] });
    }
  },
  requiredBotPerms: requiredBotPerms,
  requiredUserPerms: requiredUserPerms,
};
