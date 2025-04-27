const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Get a random meme')
    .addStringOption(option =>
      option
        .setName('subreddit')
        .setDescription('Specific subreddit to get meme from (default: memes)')
        .addChoices(
          { name: 'memes', value: 'memes' },
          { name: 'dankmemes', value: 'dankmemes' },
          { name: 'wholesomememes', value: 'wholesomememes' },
          { name: 'programminghumor', value: 'ProgrammerHumor' }
        )),

  async execute(interaction) {
    const subreddit = interaction.options.getString('subreddit') || 'memes';
    
    try {
      await interaction.deferReply();
      
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/random/.json`);
      const data = await response.json();

      if (!data[0]) {
        throw new Error('No meme found');
      }

      const post = data[0].data.children[0].data;

      // Check if post is suitable (not NSFW, has image)
      if (post.over_18 || !post.url || !post.url.match(/\.(jpg|jpeg|png|gif)$/i)) {
        throw new Error('Unsuitable post found, please try again');
      }

      const embed = new EmbedBuilder()
        .setColor('#88C0D0')
        .setTitle(post.title)
        .setURL(`https://reddit.com${post.permalink}`)
        .setImage(post.url)
        .setFooter({ 
          text: `👍 ${post.ups} | 💬 ${post.num_comments} | Posted by u/${post.author}` 
        });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: 'Failed to fetch a meme. Please try again later.',
        ephemeral: true
      });
    }
  }
};