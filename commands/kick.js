const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to kick')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the kick')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    try {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if the bot can kick the user
      if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: 'I cannot kick this user as their highest role is above or equal to mine.',
          ephemeral: true
        });
      }

      // Check if the command user can kick the target user
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({
          content: 'You cannot kick this user as their highest role is above or equal to yours.',
          ephemeral: true
        });
      }

      // Try to DM the user before kicking
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle(`You were kicked from ${interaction.guild.name}`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not DM user ${user.tag}`);
      }

      // Kick the user
      await member.kick(`${reason} - Kicked by ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('User Kicked')
        .addFields(
          { name: 'User', value: `${user.tag}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to kick the user. Please check my permissions and try again.',
        ephemeral: true
      });
    }
  }
};