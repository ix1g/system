const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Quote a message by its link')
    .addStringOption(option =>
      option
        .setName('messagelink')
        .setDescription('The link to the message to quote')
        .setRequired(true)),

  async execute(interaction) {
    const messageLink = interaction.options.getString('messagelink');
    
    try {
      // Parse message link
      const matches = messageLink.match(/channels\/(\d+)\/(\d+)\/(\d+)/);
      if (!matches) {
        return interaction.reply({
          content: 'Invalid message link. Right-click a message and select "Copy Message Link".',
          ephemeral: true
        });
      }

      const [, , channelId, messageId] = matches;
      const channel = await interaction.client.channels.fetch(channelId);
      
      if (!channel) {
        return interaction.reply({
          content: 'Cannot access the channel of the quoted message.',
          ephemeral: true
        });
      }

      const quotedMessage = await channel.messages.fetch(messageId);
      if (!quotedMessage) {
        return interaction.reply({
          content: 'Cannot find the message to quote.',
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor('#88C0D0')
        .setAuthor({
          name: quotedMessage.author.tag,
          iconURL: quotedMessage.author.displayAvatarURL({ dynamic: true })
        })
        .setDescription(quotedMessage.content)
        .setFooter({ 
          text: `Quoted by ${interaction.user.tag} | ${quotedMessage.channel.name}` 
        })
        .setTimestamp(quotedMessage.createdAt);

      // Add attachment preview if exists
      const attachment = quotedMessage.attachments.first();
      if (attachment && attachment.contentType?.startsWith('image/')) {
        embed.setImage(attachment.url);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Failed to quote the message. Make sure I have access to the channel.',
        ephemeral: true
      });
    }
  }
};