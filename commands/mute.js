const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Timeout a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to timeout')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Duration in minutes (max 40320 = 4 weeks)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(40320))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for the timeout')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const duration = interaction.options.getInteger('duration');
    const reason = interaction.options.getString('reason');

    try {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if the bot can timeout the user
      if (member.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
        return interaction.reply({
          content: 'I cannot timeout this user as their highest role is above or equal to mine.',
          ephemeral: true
        });
      }

      // Check if the command user can timeout the target user
      if (member.roles.highest.position >= interaction.member.roles.highest.position) {
        return interaction.reply({
          content: 'You cannot timeout this user as their highest role is above or equal to yours.',
          ephemeral: true
        });
      }

      // Try to DM the user before timing out
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle(`You were timed out in ${interaction.guild.name}`)
          .addFields(
            { name: 'Duration', value: `${duration} minutes` },
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not DM user ${user.tag}`);
      }

      // Timeout the user
      await member.timeout(duration * 60 * 1000, `${reason} - Timed out by ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#FFA500')
        .setTitle('User Timed Out')
        .addFields(
          { name: 'User', value: `${user.tag}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Duration', value: `${duration} minutes` },
          { name: 'Reason', value: reason },
          { name: 'Expires', value: `<t:${Math.floor(Date.now() / 1000 + duration * 60)}:R>` }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to timeout the user. Please check my permissions and try again.',
        ephemeral: true
      });
    }
  }
};