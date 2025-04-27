const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption(option =>
      option
        .setName('userid')
        .setDescription('The ID of the user to unban')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the unban')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason');

    try {
      // Fetch ban info
      const ban = await interaction.guild.bans.fetch(userId);
      if (!ban) {
        return interaction.reply({
          content: 'This user is not banned.',
          ephemeral: true
        });
      }

      // Unban the user
      await interaction.guild.members.unban(userId, `${reason} - Unbanned by ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('User Unbanned')
        .addFields(
          { name: 'User', value: `${ban.user.tag}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      if (error.code === 10026) {
        await interaction.reply({
          content: 'User ID is invalid or user is not banned.',
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: 'Failed to unban the user. Please check my permissions and try again.',
          ephemeral: true
        });
      }
    }
  }
};