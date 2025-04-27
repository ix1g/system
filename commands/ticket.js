const { 
  SlashCommandBuilder, 
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
  ChannelType
} = require('discord.js');
const { QuickDB } = require('quick.db');
const config = require('../config.json');
const db = new QuickDB();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Manage the ticket system')
    .addSubcommand(subcommand =>
      subcommand
        .setName('setup')
        .setDescription('Setup ticket system in a channel')
        .addChannelOption(option =>
          option
            .setName('channel')
            .setDescription('The channel to set up tickets in')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('close')
        .setDescription('Close the current ticket'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('rename')
        .setDescription('Rename the current ticket')
        .addStringOption(option =>
          option
            .setName('name')
            .setDescription('New name for the ticket')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'setup') {
      const channel = interaction.options.getChannel('channel');
      
      // Create setup modal
      const modal = new ModalBuilder()
        .setCustomId('ticket_setup_modal')
        .setTitle('Ticket System Setup');

      const welcomeInput = new TextInputBuilder()
        .setCustomId('welcome_message')
        .setLabel('Welcome Message')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Enter welcome message (use {user} for mentions)')
        .setValue('Welcome {user}! Please describe your issue.')
        .setRequired(true);

      const row = new ActionRowBuilder().addComponents(welcomeInput);
      modal.addComponents(row);

      await interaction.showModal(modal);

    } else if (subcommand === 'close') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({
          content: 'This command can only be used in ticket channels.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(config.nordColors.danger)
        .setDescription('Ticket will be closed in 5 seconds...');

      await interaction.reply({ embeds: [embed] });
      setTimeout(() => interaction.channel.delete(), 5000);

    } else if (subcommand === 'rename') {
      if (!interaction.channel.name.startsWith('ticket-')) {
        return interaction.reply({
          content: 'This command can only be used in ticket channels.',
          ephemeral: true
        });
      }

      const newName = interaction.options.getString('name');
      await interaction.channel.setName(newName);
      
      const embed = new EmbedBuilder()
        .setColor(config.nordColors.success)
        .setDescription(`Ticket renamed to: ${newName}`);

      await interaction.reply({ embeds: [embed] });
    }
  },

  // Modal submit handler
  async modalSubmit(interaction) {
    if (interaction.customId === 'ticket_setup_modal') {
      const welcomeMessage = interaction.fields.getTextInputValue('welcome_message');
      
      const embed = new EmbedBuilder()
        .setColor(config.nordColors.primary)
        .setTitle('🎫 Support Tickets')
        .setDescription(welcomeMessage)
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('create_ticket')
          .setLabel('Create Ticket')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('📩'),
        new ButtonBuilder()
          .setCustomId('view_tickets')
          .setLabel('My Tickets')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📋')
      );

      const channel = interaction.options.getChannel('channel');
      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: 'Ticket system has been set up!', ephemeral: true });
    }
  },

  // Button interaction handler
  async buttonInteract(interaction) {
    if (interaction.customId === 'create_ticket') {
      const count = await db.get('ticket_count') || 0;
      const newCount = count + 1;
      
      const channel = await interaction.guild.channels.create({
        name: `ticket-${newCount.toString().padStart(4, '0')}`,
        type: ChannelType.GuildText,
        parent: config.ticketSettings.categoryId,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          ...config.ticketSettings.staffRoleIds.map(id => ({
            id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          })),
        ],
      });

      await db.set('ticket_count', newCount);
      
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('close_ticket')
          .setLabel('Close')
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId('claim_ticket')
          .setLabel('Claim')
          .setStyle(ButtonStyle.Primary)
      );

      const embed = new EmbedBuilder()
        .setColor(config.nordColors.primary)
        .setTitle(`Ticket #${newCount}`)
        .setDescription(config.ticketSettings.welcomeMessage.replace('{user}', interaction.user.toString()))
        .setTimestamp();

      await channel.send({ embeds: [embed], components: [row] });
      await interaction.reply({ content: `Your ticket has been created: ${channel}`, ephemeral: true });
    }
  }
};