const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to ban')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the ban')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('delete_days')
        .setDescription('Number of days of messages to delete')
        .setMinValue(0)
        .setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const deleteDays = interaction.options.getInteger('delete_days') || 0;

    try {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if the bot can ban the user
      if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: 'I cannot ban this user as their highest role is above or equal to mine.',
          ephemeral: true
        });
      }

      // Check if the command user can ban the target user
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({
          content: 'You cannot ban this user as their highest role is above or equal to yours.',
          ephemeral: true
        });
      }

      // Try to DM the user before banning
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`You were banned from ${interaction.guild.name}`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not DM user ${user.tag}`);
      }

      // Ban the user
      await interaction.guild.members.ban(user, {
        deleteMessageDays: deleteDays,
        reason: `${reason} - Banned by ${interaction.user.tag}`
      });

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('User Banned')
        .addFields(
          { name: 'User', value: `${user.tag}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason },
          { name: 'Message Deletion', value: `${deleteDays} days` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to ban the user. Please check my permissions and try again.',
        ephemeral: true
      });
    }
  }
};