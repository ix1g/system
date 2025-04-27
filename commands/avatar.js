const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Get user\'s avatar')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to get avatar from')
        .setRequired(false)),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const avatarUrl = user.displayAvatarURL({ 
      size: 4096, 
      dynamic: true 
    });

    const embed = new EmbedBuilder()
      .setColor('#88C0D0')
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(avatarUrl)
      .setFooter({ text: `Requested by ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};