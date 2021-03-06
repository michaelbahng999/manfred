import * as express from 'express';
import * as body_parser from 'body-parser';
import * as express_validator from 'express-validator';
import * as connection from 'knex';
import * as moment from 'moment';

import { rollDie } from './dnd/dice';
import { Client, Message, WebhookClient } from 'discord.js';
import { log } from 'winston';
import {TypeState} from 'typestate';

import {parseEventString, Event} from './events/parser';
export const PORT: number = parseInt(process.env.PORT) || 3000;

export function init() {
  let confirmed = false;
  // these should be injected into init;
  // discord_client should be set up with listeners before being
  // used as a dependency.
  const server = express();
  const db = connection(require('../knexfile.js')[process.env.NODE_ENV]);
  const discord_client = new Client();

  // Express config
  server.use(body_parser.urlencoded({ extended: true }));
  server.use(body_parser.json());
  server.use(express_validator());
  if (process.env.NODE_ENV !== 'production') {
    server.disable('etag');
  }

  // Discord config
  let discord_token;
  if (process.env.DISCORD_TOKEN) {
    discord_token = process.env.DISCORD_TOKEN;
  }
  else {
    discord_token = require('../discord.config.js').BOT_TOKEN;
  }
  discord_client.on('ready', () => {
    log('info', "Bot is ready.");
    const channel = discord_client.channels.get('338185682386288641');
  });
  discord_client.on('guildMemberAdd', member => {
    log('info', 'Bot is greeting new member');
    member.send('Welcome to the test channel. Try "manfred help".');
  });
  discord_client.on('message', message => {
    const has_prefix = (msg_string: string) => {
      return msg_string.toLowerCase().startsWith("manfred");
    };
    
    if (message.author.id === discord_client.user.id) {
      log('info', 'same id.');
      return;
    }
    // non-commands
    if (!confirmed) {
      confirmed = true;
      log('info', 'toggled confirmed');
      if(message.content.toLowerCase() === 'yes') {
        message.channel.send("Well, I can't save this yet so too bad for you.");
      }
      else if (message.content.toLowerCase() === 'no') {
        message.channel.send("Hah, it would have been a waste of time anyway.");
      }
    }

    if (!has_prefix(message.content)) {
      log('info', 'Not for manfred.');
      return;
    }
    message.content = message.content.toLowerCase().trim();
    message.content = message.content.replace('manfred ', '');

    if (message.content.startsWith('help')) {
      log('info', 'Sending help message.');
      message.author.send('Tsk tsk tsk... you ask me for help?')
      .then(() => message.author.send(
        ["I am still in alpha stage. Some commands:```",
        '- "manfred help":                            Plead for help.',
        '- "manfred status":                          Check how long I have been running.',
        '```'
        ].join("\r\n")
      ));
      return;
    }

    if (message.content.startsWith('status')) {
      message.channel.send('I am still alive, fool!');
      message.channel.send(`Uptime: since ${moment().subtract(discord_client.uptime, 'milliseconds').fromNow()}`);
      return;
    }

    if (message.content.startsWith('schedule')) {
      const event: Event = parseEventString(message.content.replace('schedule ', ''));
      log('info', `Parsed event: ${JSON.stringify(event)}`);
      const endMessage = event.endDate ? `, ends at ${moment(event.endDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}` : '.'

      const formatResp = (event: Event) => {
        let resp = `I will plan an event "${event.eventTitle}"`;
        if (event.isAllDay) {
          resp += ' for the entire day.';
        }
        else {
          resp += ` which starts at ${moment(event.startDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}`;
          resp += event.endDate ?
            ` and ends at ${moment(event.endDate).format("dddd, MMMM Do YYYY, h:mm:ss a")}.` : '.';
        }
        return resp;
      }

      message.channel.send(
        formatResp(event)
      )
      .then(() => {
        message.channel.send('Will that do, fool? (yes/no)').then(() => {
          confirmed = false;
        });
      });
    }
  });
  discord_client.login(discord_token)
    .then(() => {
      log('info', 'Logged in to discord.');
    })
    .catch(err => {
      log('error', `Error logging into discord, ${err}`);
      throw err;
    });
  return {server, db, discord_client};
}
