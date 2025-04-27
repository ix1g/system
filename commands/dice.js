const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Roll one or more dice')
    .addIntegerOption(option =>
      option
        .setName('dice')
        .setDescription('Number of dice to roll')
        .setMinValue(1)
        .setMaxValue(10)
        .setRequired(true))
    .addIntegerOption(option =>
      option
        .setName('sides')
        .setDescription('Number of sides on each die')
        .setMinValue(2)
        .setMaxValue(100)
        .setRequired(true)),

  async execute(interaction) {
    const numberOfDice = interaction.options.getInteger('dice');
    const sides = interaction.options.getInteger('sides');

    let rolls = [];
    let total = 0;

    for (let i = 0; i < numberOfDice; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }

    const embed = new EmbedBuilder()
      .setColor('#88C0D0')
      .setTitle('🎲 Dice Roll')
      .addFields(
        { name: 'Dice', value: `${numberOfDice}d${sides}`, inline: true },
        { name: 'Rolls', value: rolls.join(', '), inline: true },
        { name: 'Total', value: total.toString(), inline: true }
      )
      .setFooter({ text: `Rolled by ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};