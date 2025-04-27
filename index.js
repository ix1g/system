const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.commands = new Collection();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    commands.push(command.data.toJSON());
  }
}

// Deploy slash commands when bot starts
client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);
  
  try {
    console.log('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands },
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
});

// Handle all types of interactions
client.on('interactionCreate', async interaction => {
  try {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction);
    }
    
    // Handle buttons
    else if (interaction.isButton()) {
      const [commandName, ...args] = interaction.customId.split('_');
      const command = client.commands.get(commandName);
      
      if (command?.buttonInteract) {
        await command.buttonInteract(interaction, args);
      }
    }
    
    // Handle modals
    else if (interaction.isModalSubmit()) {
      const [commandName, ...args] = interaction.customId.split('_');
      const command = client.commands.get(commandName);
      
      if (command?.modalSubmit) {
        await command.modalSubmit(interaction, args);
      }
    }
    
    // Handle select menus
    else if (interaction.isStringSelectMenu()) {
      const [commandName, ...args] = interaction.customId.split('_');
      const command = client.commands.get(commandName);
      
      if (command?.selectMenuInteract) {
        await command.selectMenuInteract(interaction, args);
      }
    }
  } catch (error) {
    console.error(error);
    try {
      const errorMessage = { 
        content: 'There was an error executing this interaction!', 
        ephemeral: true 
      };
      
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(errorMessage);
      } else {
        await interaction.reply(errorMessage);
      }
    } catch (e) {
      console.error('Error sending error message:', e);
    }
  }
});

client.login(process.env.BOT_TOKEN);