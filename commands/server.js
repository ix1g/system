const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Get information about the server'),

  async execute(interaction) {
    const { guild } = interaction;
    
    // Get member counts
    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter(member => member.user.bot).size;
    const humanCount = totalMembers - botCount;

    // Get channel counts
    const channels = guild.channels.cache;
    const textChannels = channels.filter(c => c.type === 0).size;
    const voiceChannels = channels.filter(c => c.type === 2).size;
    const categoryChannels = channels.filter(c => c.type === 4).size;

    const embed = new EmbedBuilder()
      .setColor('#88C0D0')
      .setTitle(guild.name)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'Created', value: `<t:${Math.floor(guild.createdAt.getTime() / 1000)}:R>`, inline: true },
        { name: 'Boost Level', value: `Level ${guild.premiumTier}`, inline: true },
        { name: 'Members', value: `👥 Total: ${totalMembers}\n👤 Human: ${humanCount}\n🤖 Bots: ${botCount}`, inline: true },
        { name: 'Channels', value: `💬 Text: ${textChannels}\n🔊 Voice: ${voiceChannels}\n📑 Categories: ${categoryChannels}`, inline: true },
        { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true }
      )
      .setFooter({ text: `ID: ${guild.id}` });

    if (guild.banner) embed.setImage(guild.bannerURL({ size: 4096 }));

    await interaction.reply({ embeds: [embed] });
  }
};