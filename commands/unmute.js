const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Remove timeout from a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to remove timeout from')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Reason for removing the timeout')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    try {
      const member = await interaction.guild.members.fetch(user.id);

      // Check if user is actually timed out
      if (!member.isCommunicationDisabled()) {
        return interaction.reply({
          content: 'This user is not timed out.',
          ephemeral: true
        });
      }

      // Remove the timeout
      await member.timeout(null, `${reason} - Timeout removed by ${interaction.user.tag}`);

      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Timeout Removed')
        .addFields(
          { name: 'User', value: `${user.tag}`, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });

      // Try to DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle(`Your timeout in ${interaction.guild.name} has been removed`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not DM user ${user.tag}`);
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to remove timeout from the user. Please check my permissions and try again.',
        ephemeral: true
      });
    }
  }
};