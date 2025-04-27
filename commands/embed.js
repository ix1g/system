const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Create an embedded message'),

  async execute(interaction) {
    if (!config.commandSettings.embed) {
      return interaction.reply({
        content: 'This command is currently disabled.',
        ephemeral: true
      });
    }

    const modal = new ModalBuilder()
      .setCustomId('embed_create')
      .setTitle('Create Embed');

    const contentInput = new TextInputBuilder()
      .setCustomId('embed_content')
      .setLabel('Message Content')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Enter your message here...')
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(contentInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  },

  async modalSubmit(interaction) {
    if (interaction.customId === 'embed_create') {
      const content = interaction.fields.getTextInputValue('embed_content');

      const embed = new EmbedBuilder()
        .setColor(config.nordColors.primary)
        .setDescription(content)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
};