const { EmbedBuilder } = require('discord.js');
const config = require('../config.json');
const fs = require('fs');

module.exports = {
  name: 'toggle',
  description: 'Toggle commands on/off or view staff points',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You need administrator permissions to use this command.');
    }

    const subCommand = args[0];
    const commandName = args[1];

    if (subCommand === 'command') {
      if (!commandName || !config.commandSettings.hasOwnProperty(commandName)) {
        return message.reply('Please specify a valid command to toggle.');
      }

      config.commandSettings[commandName] = !config.commandSettings[commandName];
      fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));

      const status = config.commandSettings[commandName] ? 'enabled' : 'disabled';
      message.reply(`Command "${commandName}" has been ${status}.`);
    
    } else if (subCommand === 'points') {
      const embed = new EmbedBuilder()
        .setColor(config.nordColors.primary)
        .setTitle('Staff Points')
        .setDescription('Points earned from handling tickets:')
        .addFields(
          Object.entries(global.staffPoints || {}).map(([userId, points]) => ({
            name: `<@${userId}>`,
            value: `${points} points`,
            inline: true
          }))
        );

      message.reply({ embeds: [embed] });
    } else {
      message.reply('Usage:\n/toggle command <command_name>\n/toggle points');
    }
  }
};