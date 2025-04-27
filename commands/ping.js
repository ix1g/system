const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check the bot\'s latency'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const embed = new EmbedBuilder()
      .setColor(config.nordColors.primary)
      .setDescription(`Pong! Latency is ${sent.createdTimestamp - interaction.createdTimestamp}ms.`);

    await interaction.editReply({ content: null, embeds: [embed] });
  }
};