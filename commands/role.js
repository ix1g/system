const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Manage roles for users')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to a user')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('The user to add the role to')
            .setRequired(true))
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The role to add')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from a user')
        .addUserOption(option =>
          option
            .setName('user')
            .setDescription('The user to remove the role from')
            .setRequired(true))
        .addRoleOption(option =>
          option
            .setName('role')
            .setDescription('The role to remove')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    
    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      return interaction.reply({
        content: 'User not found in the server.',
        ephemeral: true
      });
    }

    // Check if the bot can manage the role
    if (role.position >= interaction.guild.members.me.roles.highest.position) {
      return interaction.reply({
        content: 'I cannot manage this role as it is above or equal to my highest role.',
        ephemeral: true
      });
    }

    try {
      if (subcommand === 'add') {
        await member.roles.add(role);
        const embed = new EmbedBuilder()
          .setColor(config.nordColors.success)
          .setDescription(`Added role ${role} to ${user}`);
        
        await interaction.reply({ embeds: [embed] });

      } else if (subcommand === 'remove') {
        await member.roles.remove(role);
        const embed = new EmbedBuilder()
          .setColor(config.nordColors.warning)
          .setDescription(`Removed role ${role} from ${user}`);
        
        await interaction.reply({ embeds: [embed] });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to modify roles. Please check my permissions.',
        ephemeral: true
      });
    }
  }
};