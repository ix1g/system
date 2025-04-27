const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: 'come',
  description: 'Send a DM to a user with the channel link',
  async execute(message, args) {
    if (!config.commandSettings.come) {
      return message.reply('This command is currently disabled.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Please mention a user to send the invitation to.');
    }

    const embed = new EmbedBuilder()
      .setColor(config.nordColors.primary)
      .setTitle('Channel Invitation')
      .setDescription(`You have been invited to visit ${message.channel}\nClick the link above to join the conversation!`)
      .setTimestamp();

    try {
      await user.send({ embeds: [embed] });
      message.reply(`Invitation sent to ${user.tag}`);
    } catch (error) {
      message.reply('Could not send DM to that user. They might have DMs disabled.');
    }
  }
};