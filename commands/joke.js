const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Get a random joke')
    .addStringOption(option =>
      option
        .setName('category')
        .setDescription('The category of joke')
        .addChoices(
          { name: 'Programming', value: 'programming' },
          { name: 'Miscellaneous', value: 'misc' },
          { name: 'Dark', value: 'dark' },
          { name: 'Pun', value: 'pun' },
          { name: 'Spooky', value: 'spooky' },
          { name: 'Christmas', value: 'christmas' }
        )),

  async execute(interaction) {
    const category = interaction.options.getString('category');
    let url = 'https://v2.jokeapi.dev/joke/';
    
    if (category) {
      url += category;
    } else {
      url += 'Any';
    }

    try {
      await interaction.deferReply();
      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.message);
      }

      const embed = new EmbedBuilder()
        .setColor('#88C0D0')
        .setTitle('😄 Random Joke')
        .setFooter({ text: `Category: ${data.category}` });

      if (data.type === 'single') {
        embed.setDescription(data.joke);
      } else {
        embed.addFields(
          { name: 'Setup', value: data.setup },
          { name: 'Delivery', value: data.delivery }
        );
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'Failed to fetch a joke. Please try again later.',
        ephemeral: true
      });
    }
  }
};