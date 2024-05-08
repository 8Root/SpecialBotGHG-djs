// Importing all the Stuff
const { Client, GatewayIntentBits, Collection, Events , AuditLogEvent, Message, EmbedBuilder, ClientPresence, Webhook, Guild, PermissionFlagsBits, PermissionsBitField, ActivityType } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { joinVoiceChannel } = require('@discordjs/voice'); //Brauche Ich später lololol
const { Routes } = require('discord-api-types/v9');
const { token, appid } = require('./config.json');
const chalk = require('chalk')
const cliProgress = require('cli-progress')
const database = require('../SpecialBotGHG/lib/database')
const fs = require('fs');


const dbApp = new database()

const bar1 = new cliProgress.SingleBar({
  format: '[{bar}] {percentage}% | {prefix} {message}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  stream: process.stdout,
  fps: 60,
  stopOnComplete: true,
  clearOnComplete: false,
  formatValue: (value, _, type) => {
    if (type === 'message') {
      return chalk.hex('#6a0dad')(value);
    }
    return value;
  },
}, cliProgress.Presets.shades_classic);

bar1.start(500, 0, {
  prefix: chalk.hex('#6a0dad')('[App]'),
  message: 'Starting...',
});

const helpEmbed = new EmbedBuilder()
  .setColor(0x0099FF)
  .setAuthor({ name: '@SpecialZockerGHG', iconURL: 'https://cdn.rootqit.dev/img/SpecialZockerGHG.png', url: 'https://SpecialZocker.rootqit.dev/' })
  .setTitle('All the commands.')
  .setURL('https://rootqit.dev/')
  .setDescription('Yeah, idk what to put here.\n')
  .setImage('https://cdn.rootqit.dev/img/SpecialZockerGHG.png')
  .setThumbnail('https://cdn.rootqit.dev/img/SpecialZockerGHG.png')
  .addFields(
    { name: '/about', value: 'About The Bot.' },
    { name: '\u200B', value: '\u200B' },
    { name: '/help', value: 'Shows this command.' },
    { name: '\u200B', value: '\u200B' },
    { name: '/ping', value: 'Replies with the ping.' },
    { name: '\u200B', value: '\u200B' },
    { name: '/poll', value: 'Creates a poll.' } // New poll command
  )
  .addFields({ name: 'Irgendwas', value: '-EinName', inline: true })
  .setImage('https://cdn.rootqit.dev/img/SpecialZockerGHG.png')
  .setTimestamp()
  .setFooter({ text: 'Bot made by @Rootqit', iconURL: 'https://cdn.rootqit.dev/img/FrokC.png' });

const aboutEmbed = new EmbedBuilder()
  .setColor(0x0099FF)
  .setAuthor({ name: '@SpecialZockerGHG', iconURL: 'https://cdn.rootqit.dev/img/SpecialZockerGHG.png', url: 'https://SpecialZocker.rootqit.dev/' })
  .setTitle('About the bot')
  .setURL('https://rootqit.dev/')
  .setDescription('Yeah, idk what to put here.\n')
  .setImage('https://cdn.rootqit.dev/img/SpecialZockerGHG.png')
  .setThumbnail('https://cdn.rootqit.dev/img/SpecialZockerGHG.png')
  .addFields({ name: 'Eine Sache ugabuga', value: '-EinName', inline: true })
  .setImage('https://cdn.rootqit.dev/img/SpecialZockerGHG.png')
  .setTimestamp()
  .setFooter({ text: 'Bot made by @Rootqit', iconURL: 'https://cdn.rootqit.dev/img/FrokC.png' });

// Some DiscordJS stuff
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMembers] });
client.commands = new Collection();

function makeid(length) {
  let result = '';
  const characters = 'xyzXYZ0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  
  return `${hours}:${minutes}:${seconds}`;
}

function getCurrentDate() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString();
  return `${day}-${month}-${year}`;
}

const currentDate = getCurrentDate();
console.log(currentDate); // Output: 01-01-2022 (example)


const fslogger = fs.createWriteStream('./event.log.' + getCurrentDate(), { flags: 'w' });

function log(event) {
  console.log(chalk.magenta('[APP]: ') + chalk.gray(event));
  fslogger.write('[APP, { ' + getCurrentTime() + ' }]: ' + event);
}


// Commands (I do not like the commandbuilder)
const commands = [
  {
    name: 'ping',
    description: 'Replies with the bot and api ping!'
  },
  {
    name: 'help',
    description: 'Replies with all the commands.'
  },
  {
    name: 'about',
    description: 'Replies with some infos about the bot.'
  },
  {
    name: 'poll',
    description: 'Creates a poll.',
    Permissions: 'ADMINISTRATOR',
    options: [
        {
            name: 'name',
            description: 'Provide the name of the Poll.',
            type: 3,
            required: true
        },
        {
            name: 'description',
            description: 'Provide the description of the Poll.',
            type: 3,
            required: true
        },
        {
            name: 'option1',
            description: 'The first option for the poll',
            type: 3,
            required: true
        },
        {
            name: 'option2',
            description: 'The second option for the poll',
            type: 3, 
            required: true
        }
    ]
  },
  {
    name: 'announce',
    description: 'Make an announcement.',
    Permissions: 'ADMINISTRATOR',
    options: [
        {
            name: 'title',
            description: 'Provide the title.',
            type: 3,
            required: true
        },
        {
            name: 'description',
            description: 'Provide the description of the announcement.',
            type: 3,
            required: true
        },
        {
            name: 'largeimageurl',
            description: 'Provide the URL of the large image.',
            type: 3,
            required: true
        },
        {
            name: 'additionalfield1',
            description: 'Provide the first additional field of the announcement.',
            type: 3,
            required: true
        },
        {
            name: 'additionalfield2',
            description: 'Provide the description of the announcement.',
            type: 3,
            required: true
        },
    ]
  },
  {
    name: 'ticket',
    description: 'Make a ticket!'
  }
];

const rest = new REST({ version: '9' }).setToken(token);

(async () => {
  try {
    bar1.update(100, {
      message: 'Refreshing application (/) commands...',
    });
    await rest.put(
      Routes.applicationCommands(appid),
      { body: commands },
    );

    bar1.update(100, {
      message: 'Successfully reloaded application (/) commands.',
    });
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  bar1.update(300, {
    message: 'Setting activity...',
  });
  client.user.setActivity('real', { type: ActivityType.Watching }, )
  client.user.setStatus('idle')
  console.clear()
  bar1.update(400, {
    message: 'Activity Set!',
  });
  bar1.update(500)
  bar1.stop
  console.clear()
  console.log(chalk.magenta('[APP]: ') + chalk.grey('App successfully started, waiting for events...'))
});

//client.on('debug', debug => { log(debug)})
client.on('messageCreate', async (message) => {if (message.author.bot) return;log(`${chalk.yellow('User: ')} ${chalk.cyan(message.author.username)} ${chalk.cyanBright('|')} ${chalk.yellow('Guild: ')} ${chalk.cyan(message.guild.name)} ${chalk.cyanBright('|')} ${chalk.yellow('Channel: ')} ${chalk.cyan(message.channel.name)} ${chalk.cyanBright('|')} ${chalk.yellow('Message:')} ${chalk.cyan(message.content)} ${chalk.red('[TYPE: MessageCreate]')}`);});
client.on('channelDelete', async (delchannel) => { const guild = delchannel.guild; auditLogs = await guild.fetchAuditLogs({ limit: 1, type: 12 }); const entry = auditLogs.entries.first();if (entry) {const executor = entry.executor;log(`${chalk.yellow('User: ')} ${chalk.cyan(executor.username)} ${chalk.cyanBright('|')} ${chalk.yellow('Guild: ')} ${chalk.cyan(delchannel.guild)} ${chalk.cyanBright('|')} ${chalk.yellow('Channel: ')} ${chalk.cyan(delchannel.name)} ${chalk.cyanBright('|')} ${chalk.yellow('ChannelType: ')} ${chalk.cyan(delchannel.type)} ${chalk.red('[TYPE: ChannelDelete]')}`);}});
client.on('channelCreate', async (crechannel) => { const guild = crechannel.guild; auditLogs = await guild.fetchAuditLogs({ limit: 1, type: 12 }); const entry = auditLogs.entries.first();if (entry) {const executor = entry.executor;log(`${chalk.yellow('User: ')} ${chalk.cyan(executor.username)} ${chalk.cyanBright('|')} ${chalk.yellow('Guild: ')} ${chalk.cyan(crechannel.guild)} ${chalk.cyanBright('|')} ${chalk.yellow('Channel: ')} ${chalk.cyan(crechannel.name)} ${chalk.cyanBright('|')} ${chalk.yellow('ChannelType: ')} ${chalk.cyan(crechannel.type)} ${chalk.red('[TYPE: ChannelCreate]')}`);}});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const commandName = interaction.commandName;
  const args = interaction.options;

  if (commandName === 'ping') {
    await interaction.reply("Pinging... [----------]");
    const dat = Date.now();
    const latency = dat - interaction.createdTimestamp;
    if (isNaN(latency)) {
      await interaction.editReply(`⌛ Latency is for some reason not available right now.  -  ⏲ API Ping is ${Math.round(client.ws.ping)}`);
    } else {
      await interaction.editReply(`⌛ Latency is ${latency}ms  -  ⏲ API Ping is ${Math.round(client.ws.ping)}`);
    }
  } else if (commandName === 'help') {
    interaction.reply({ embeds: [helpEmbed] });
  } else if (commandName === 'about') {
    interaction.reply({ embeds: [aboutEmbed] });
  } else if (commandName === 'poll') {
    const name = args.getString('name');
    const description = args.getString('description');
    const option1 = args.getString('option1');
    const option2 = args.getString('option2');
    const pollchannelid = '1121518559869292645'

    const avatar = interaction.user.displayAvatarURL();
    const creator = interaction.user.username;

    const pollEmbed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(name)
      .setDescription(description)
      .addFields(
        { name: 'Option 1', value: option1, inline: true },
        { name: 'Option 2', value: option2, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Poll created by @' + creator, iconURL: avatar });


    if (interaction.member.roles.cache.has('1097933014421479474')) {
      const certmsg = await interaction.reply('Sup Admin. Poll Successfully created. This Reply will self-destruct in 5 seconds.')
      certmsg.react('✔');
      const msg = await client.channels.cache.get(`${pollchannelid}`).send({ embeds: [pollEmbed], fetchReply: true });
      msg.react('1️⃣');
      msg.react('2️⃣');
      await delay(5000)
      await interaction.deleteReply();
    } else if (interaction.user.id === '1095024441613881416'){
      const certmsg = await interaction.reply('Special Zocker ????. Message Successfully sent. This Reply will self-destruct in 5 seconds.')
      certmsg.react('✔');
      const msg = await client.channels.cache.get(`${pollchannelid}`).send({ embeds: [pollEmbed], fetchReply: true });
      msg.react('1️⃣');
      msg.react('2️⃣');
      await delay(5000)
      await interaction.deleteReply();
    } else if (interaction.user.id === '980804735382716426'){
      const certmsg = await interaction.reply('Yoo Rootqit??? Message Successfully sent. This Reply will self-destruct in 5 seconds.')
      certmsg.react('✔');
      const msg = await client.channels.cache.get(`${pollchannelid}`).send({ embeds: [pollEmbed], fetchReply: true });
      msg.react('1️⃣');
      msg.react('2️⃣');
      await delay(5000)
      await interaction.deleteReply();
    } else {
      const skullmsg = await interaction.reply(`Bro really tried 💀. You aint permitted **${interaction.user.username}**. Lmao funny name.`)
      skullmsg.react('💀');
      skullmsg.react('🤡');
    }
  } else if (commandName === 'ticket') {
    interaction.reply('Please use the Ticket Bot for this command!')
  } else if (commandName === 'announce') {
    const announcementchannelid = '1100811902180921456'
    const title = args.getString('title')
    const description = args.getString('description')
    const bigimage = args.getString('largeimageurl')
    const field1 = args.getString('additionalfield1')
    const field2 = args.getString('additionalfield1')
    const avatar = interaction.user.displayAvatarURL();
    const creator = interaction.user.username;
    const announcement = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(title)
        .setDescription(description)
        .addFields(
          { name: 'Field 1', value: field1, inline: true },
          { name: 'Field 2', value: field2, inline: true }
        )
        .setImage(bigimage)
        .setTimestamp()
        .setFooter({ text: 'Announcement created by @' + creator, iconURL: avatar });
  
    if (interaction.member.roles.cache.has('1097933014421479474')) {
      const certmsg = await interaction.reply('Sup Admin. Announcement Successfully sent. This Reply will self-destruct in 5 seconds.')
      certmsg.react('✔');
      const msg = await client.channels.cache.get(`${announcementchannelid}`).send({ embeds: [announcement], fetchReply: true });
      msg.react('📣');
      await delay(5000)
      await interaction.deleteReply();
    } else if (interaction.user.id === '1095024441613881416'){
      const certmsg = await interaction.reply('Special Zocker ????. Announcement Successfully sent. This Reply will self-destruct in 5 seconds.')
      certmsg.react('✔');
      const msg = await client.channels.cache.get(`${announcementchannelid}`).send({ embeds: [announcement], fetchReply: true });
      msg.react('📣');
      await delay(5000)
      await interaction.deleteReply();
    } else if (interaction.user.id === '980804735382716426'){
      const certmsg = await interaction.reply('Yoo Rootqit??? Announcement Successfully sent. This Reply will self-destruct in 5 seconds.')
      certmsg.react('✔');
      const msg = await client.channels.cache.get(`${announcementchannelid}`).send({ embeds: [announcement], fetchReply: true });
      msg.react('📣');
      await delay(5000)
      await interaction.deleteReply();
    } else {
      const skullmsg = await interaction.reply(`Bro really tried 💀. You aint permitted **${interaction.user.username}**. Lmao funny name.`)
      skullmsg.react('💀');
      skullmsg.react('🤡')
    }
  }
  });


client.login(token);
