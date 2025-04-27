const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
  name: 'setup',
  description: 'Configure bot settings like role IDs and category',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You need administrator permissions to use this command.');
    }

    const modal = new ModalBuilder()
      .setCustomId('setup_modal')
      .setTitle('Bot Configuration');

    const categoryInput = new TextInputBuilder()
      .setCustomId('category_id')
      .setLabel('Ticket Category ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Right-click category and copy ID')
      .setValue(config.ticketSettings.categoryId || '')
      .setRequired(false);

    const staffRolesInput = new TextInputBuilder()
      .setCustomId('staff_role_ids')
      .setLabel('Staff Role IDs (comma-separated)')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Right-click roles and copy IDs, separate with commas')
      .setValue(config.ticketSettings.staffRoleIds.join(','))
      .setRequired(true);

    const logChannelInput = new TextInputBuilder()
      .setCustomId('log_channel_id')
      .setLabel('Log Channel ID')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Right-click channel and copy ID')
      .setValue(config.ticketSettings.logChannelId || '')
      .setRequired(false);

    const row1 = new ActionRowBuilder().addComponents(categoryInput);
    const row2 = new ActionRowBuilder().addComponents(staffRolesInput);
    const row3 = new ActionRowBuilder().addComponents(logChannelInput);

    modal.addComponents(row1, row2, row3);
    await message.showModal(modal);

    try {
      const modalSubmission = await message.awaitModalSubmit({ time: 120000 });
      const categoryId = modalSubmission.fields.getTextInputValue('category_id');
      const staffRoleIds = modalSubmission.fields.getTextInputValue('staff_role_ids')
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);
      const logChannelId = modalSubmission.fields.getTextInputValue('log_channel_id');

      // Update config
      config.ticketSettings.categoryId = categoryId;
      config.ticketSettings.staffRoleIds = staffRoleIds;
      config.ticketSettings.logChannelId = logChannelId;

      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

      const embed = new EmbedBuilder()
        .setColor(config.nordColors.success)
        .setTitle('Configuration Updated')
        .addFields(
          { name: 'Category ID', value: categoryId || 'Not set', inline: true },
          { name: 'Staff Role IDs', value: staffRoleIds.join(', ') || 'None set', inline: true },
          { name: 'Log Channel ID', value: logChannelId || 'Not set', inline: true }
        );

      await modalSubmission.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error(error);
      message.reply('Setup timed out or there was an error.');
    }
  }
};