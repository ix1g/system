const autoresponses = new Map();

module.exports = {
  name: 'autoresponder',
  description: 'Set up an autoresponder for specific keywords.',
  async execute(message, args) {
    const subCommand = args[0];

    if (subCommand === 'add') {
      const keyword = args[1];
      const response = args.slice(2).join(' ');

      if (!keyword || !response) {
        return message.reply('Usage: /autoresponder add <keyword> <response>');
      }

      autoresponses.set(keyword, response);
      message.reply(`Autoresponder added for keyword: "${keyword}"`);
    } else if (subCommand === 'remove') {
      const keyword = args[1];

      if (!keyword || !autoresponses.has(keyword)) {
        return message.reply('Keyword not found.');
      }

      autoresponses.delete(keyword);
      message.reply(`Autoresponder removed for keyword: "${keyword}"`);
    } else {
      message.reply('Usage: /autoresponder <add|remove> <keyword> <response>');
    }
  }
};