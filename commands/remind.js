const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('remind')
    .setDescription('Set a reminder')
    .addIntegerOption(option =>
      option
        .setName('duration')
        .setDescription('Duration in minutes')
        .setMinValue(1)
        .setMaxValue(10080) // 1 week max
        .setRequired(true))
    .addStringOption(option =>
      option
        .setName('reminder')
        .setDescription('What to remind you about')
        .setRequired(true)),

  async execute(interaction) {
    const duration = interaction.options.getInteger('duration');
    const reminder = interaction.options.getString('reminder');

    const embed = new EmbedBuilder()
      .setColor('#88C0D0')
      .setTitle('⏰ Reminder Set')
      .setDescription(`I will remind you about: ${reminder}`)
      .addFields(
        { name: 'Time', value: `In ${duration} minutes`, inline: true },
        { name: 'Expires', value: `<t:${Math.floor(Date.now() / 1000 + duration * 60)}:R>`, inline: true }
      )
      .setFooter({ text: `Set by ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });

    // Set the reminder
    setTimeout(async () => {
      const reminderEmbed = new EmbedBuilder()
        .setColor('#88C0D0')
        .setTitle('⏰ Reminder!')
        .setDescription(reminder)
        .setFooter({ text: `Reminder from ${duration} minutes ago` });

      try {
        await interaction.user.send({ embeds: [reminderEmbed] });
      } catch (error) {
        // If DM fails, send to the channel
        await interaction.channel.send({
          content: `${interaction.user}`,
          embeds: [reminderEmbed]
        });
      }
    }, duration * 60 * 1000);
  }
};