const shortcuts = new Map();

module.exports = {
  name: 'shortcut',
  description: 'Create or use a command shortcut.',
  async execute(message, args) {
    const subCommand = args[0];

    if (subCommand === 'create') {
      const shortcut = args[1];
      const command = args.slice(2).join(' ');

      if (!shortcut || !command) {
        return message.reply('Usage: /shortcut create <shortcut> <command>');
      }

      shortcuts.set(shortcut, command);
      message.reply(`Shortcut "/${shortcut}" created for command: "/${command}"`);
    } else if (shortcuts.has(subCommand)) {
      const command = shortcuts.get(subCommand);
      message.reply(`Executing shortcut: "/${command}"`);
      // Simulate executing the command (replace with actual logic)
    } else {
      message.reply('Shortcut not found.');
    }
  }
};