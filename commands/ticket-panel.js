const { 
  SlashCommandBuilder, 
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Create a ticket panel in the specified channel')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('The channel to send the ticket panel to')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!config.commandSettings.ticket) {
      return interaction.reply({
        content: 'The ticket system is currently disabled.',
        ephemeral: true
      });
    }

    const channel = interaction.options.getChannel('channel');

    const welcomeButtons = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel('Create Ticket')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📩'),
      new ButtonBuilder()
        .setCustomId('view_tickets')
        .setLabel('View My Tickets')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋')
    );

    const embed = new EmbedBuilder()
      .setColor(config.nordColors.primary)
      .setTitle('Support Tickets')
      .setDescription(config.ticketSettings.welcomeMessage)
      .setTimestamp();

    await channel.send({ embeds: [embed], components: [welcomeButtons] });
    await interaction.reply({ 
      content: 'Ticket panel has been created!',
      ephemeral: true
    });
  }
};