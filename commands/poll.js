const { 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder 
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll')
    .addStringOption(option =>
      option
        .setName('question')
        .setDescription('The poll question')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('question');

    const embed = new EmbedBuilder()
      .setColor('#88C0D0')
      .setTitle('📊 Poll')
      .setDescription(question)
      .addFields(
        { name: '👍 Yes', value: '0', inline: true },
        { name: '👎 No', value: '0', inline: true }
      )
      .setFooter({ text: `Started by ${interaction.user.tag}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('poll_yes')
        .setLabel('Yes')
        .setStyle(ButtonStyle.Success)
        .setEmoji('👍'),
      new ButtonBuilder()
        .setCustomId('poll_no')
        .setLabel('No')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('👎')
    );

    const message = await interaction.reply({ 
      embeds: [embed], 
      components: [row],
      fetchReply: true 
    });

    // Store initial poll data
    message.pollData = {
      yes: new Set(),
      no: new Set()
    };
  },

  async buttonInteract(interaction) {
    const vote = interaction.customId.split('_')[1];
    const message = interaction.message;
    const userId = interaction.user.id;

    // Remove previous vote if exists
    if (message.pollData.yes.has(userId)) message.pollData.yes.delete(userId);
    if (message.pollData.no.has(userId)) message.pollData.no.delete(userId);

    // Add new vote
    if (vote === 'yes') message.pollData.yes.add(userId);
    if (vote === 'no') message.pollData.no.add(userId);

    // Update embed
    const embed = EmbedBuilder.from(message.embeds[0])
      .spliceFields(0, 2)
      .addFields(
        { name: '👍 Yes', value: message.pollData.yes.size.toString(), inline: true },
        { name: '👎 No', value: message.pollData.no.size.toString(), inline: true }
      );

    await interaction.update({ embeds: [embed] });
  }
};