const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remove-warn')
    .setDescription('Remove a warning from a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to remove warning from')
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('index')
        .setDescription('The warning number to remove (1 for oldest, -1 for newest)')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    let index = interaction.options.getInteger('index');

    try {
      // Load warnings file
      const warningsPath = path.join(__dirname, '..', 'warnings.json');
      let warnings;
      try {
        const data = await fs.readFile(warningsPath, 'utf8');
        warnings = JSON.parse(data);
      } catch (error) {
        return interaction.reply({
          content: 'No warnings found.',
          ephemeral: true
        });
      }

      // Check if user has warnings
      if (!warnings[interaction.guild.id] || !warnings[interaction.guild.id][user.id] || 
          warnings[interaction.guild.id][user.id].length === 0) {
        return interaction.reply({
          content: 'This user has no warnings.',
          ephemeral: true
        });
      }

      const userWarnings = warnings[interaction.guild.id][user.id];

      // Convert negative index to positive (e.g., -1 means last warning)
      if (index < 0) {
        index = userWarnings.length + index + 1;
      }

      // Validate index
      if (index < 1 || index > userWarnings.length) {
        return interaction.reply({
          content: `Please provide a valid warning index between 1 and ${userWarnings.length}.`,
          ephemeral: true
        });
      }

      // Remove warning
      const removedWarning = userWarnings.splice(index - 1, 1)[0];

      // Remove user/guild from warnings if no warnings left
      if (userWarnings.length === 0) {
        delete warnings[interaction.guild.id][user.id];
        if (Object.keys(warnings[interaction.guild.id]).length === 0) {
          delete warnings[interaction.guild.id];
        }
      }

      // Save updated warnings
      await fs.writeFile(warningsPath, JSON.stringify(warnings, null, 2));

      // Try to DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#00FF00')
          .setTitle(`A warning was removed in ${interaction.guild.name}`)
          .addFields(
            { name: 'Original Reason', value: removedWarning.reason },
            { name: 'Moderator', value: interaction.user.tag },
            { name: 'Remaining Warnings', value: userWarnings.length.toString() }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not DM user ${user.tag}`);
      }

      // Send confirmation message
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('Warning Removed')
        .addFields(
          { name: 'User', value: user.tag, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Original Reason', value: removedWarning.reason },
          { name: 'Remaining Warnings', value: userWarnings.length.toString() }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to remove the warning. Please try again.',
        ephemeral: true
      });
    }
  }
};