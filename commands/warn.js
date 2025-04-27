const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user to warn')
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('The reason for the warning')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');

    try {
      // Load or create warnings file
      const warningsPath = path.join(__dirname, '..', 'warnings.json');
      let warnings;
      try {
        const data = await fs.readFile(warningsPath, 'utf8');
        warnings = JSON.parse(data);
      } catch (error) {
        warnings = {};
      }

      // Initialize guild and user entries if they don't exist
      if (!warnings[interaction.guild.id]) {
        warnings[interaction.guild.id] = {};
      }
      if (!warnings[interaction.guild.id][user.id]) {
        warnings[interaction.guild.id][user.id] = [];
      }

      // Add new warning
      const warning = {
        reason: reason,
        moderator: interaction.user.tag,
        timestamp: new Date().toISOString()
      };
      warnings[interaction.guild.id][user.id].push(warning);

      // Save updated warnings
      await fs.writeFile(warningsPath, JSON.stringify(warnings, null, 2));

      // Try to DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor('#FF0000')
          .setTitle(`You were warned in ${interaction.guild.name}`)
          .addFields(
            { name: 'Reason', value: reason },
            { name: 'Moderator', value: interaction.user.tag },
            { name: 'Total Warnings', value: warnings[interaction.guild.id][user.id].length.toString() }
          )
          .setTimestamp();

        await user.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.log(`Could not DM user ${user.tag}`);
      }

      // Send confirmation message
      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('Warning Issued')
        .addFields(
          { name: 'User', value: user.tag, inline: true },
          { name: 'Moderator', value: interaction.user.tag, inline: true },
          { name: 'Reason', value: reason },
          { name: 'Total Warnings', value: warnings[interaction.guild.id][user.id].length.toString() }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to warn the user. Please try again.',
        ephemeral: true
      });
    }
  }
};