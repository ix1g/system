const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Get weather information for a location')
    .addStringOption(option =>
      option
        .setName('location')
        .setDescription('The city or location to get weather for')
        .setRequired(true)),

  async execute(interaction) {
    const location = interaction.options.getString('location');
    const apiKey = process.env.WEATHER_API_KEY;

    if (!apiKey) {
      return interaction.reply({
        content: 'Weather API key is not configured.',
        ephemeral: true
      });
    }

    try {
      await interaction.deferReply();

      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`
      );

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      const embed = new EmbedBuilder()
        .setColor('#88C0D0')
        .setTitle(`Weather in ${data.name}, ${data.sys.country}`)
        .setThumbnail(`http://openweathermap.org/img/w/${data.weather[0].icon}.png`)
        .addFields(
          { 
            name: 'Temperature', 
            value: `${Math.round(data.main.temp)}°C (${Math.round(data.main.temp * 9/5 + 32)}°F)`,
            inline: true 
          },
          { 
            name: 'Weather', 
            value: data.weather[0].description,
            inline: true 
          },
          { 
            name: 'Humidity', 
            value: `${data.main.humidity}%`,
            inline: true 
          },
          { 
            name: 'Wind Speed', 
            value: `${Math.round(data.wind.speed * 3.6)} km/h`,
            inline: true 
          }
        )
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'Failed to get weather information. Please check the location name and try again.',
        ephemeral: true
      });
    }
  }
};