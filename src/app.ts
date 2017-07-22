import * as express from 'express';
import * as body_parser from 'body-parser';
import * as express_validator from 'express-validator';
import * as connection from 'knex';
import * as moment from 'moment';

import { rollDie } from './dnd/dice';
import { Client, Message, WebhookClient } from 'discord.js';
import { log } from 'winston';

import {parseEventString, Event} from './events/parser';
export const PORT: number = parseInt(process.env.PORT) || 3000;

export function init() {
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
  // if (process.env.NODE_ENV !== 'production') {
    server.disable('etag');
  // }

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
      return msg_string.toLowerCase().startsWith("manfred") ||
        msg_string.toLowerCase().startsWith("von karma");
    };
    
    if (message.author.id === discord_client.user.id) {
      log('info', 'same id.');
      return;
    }
    // non-commands
    if (!has_prefix(message.content)) {
      log('info', 'Not for manfred.');
      return;
    }
    message.content = message.content.replace('manfred ', '');
    message.content = message.content.replace('von karma ', '');
    message.content = message.content.trim();

    if (message.content.startsWith('help')) {
      log('info', 'Sending help message.');
      message.author.send('Tsk tsk tsk... you ask me for help?')
      .then(() => message.author.send(
        ["I am still in alpha stage. Some commands:```",
        '- "manfred help":                            Plead for help.',
        '- "manfred status":                          Check how long I have been running.',
        '- "manfred roll a d<number>":                Roll a die.',
        '- "manfred schedule <event>":                Schedule an event.',
        '```'
        ].join("\r\n")
      ));
      return;
    }

    log('info', `trimmedAndLow: ${message.content.toLowerCase().trim()}`);
    if (message.content.toLowerCase().trim().startsWith('roll a d')) {
      message.content = message.content.replace('roll a d', '');
      const num = parseInt(message.content.split(' ')[0]);
      if (isNaN(num)) {
        message.channel.send('Does that look like a number to you?! Imbecile!');
        return;
      }
      else {
        message.channel.send(`Rolled a ${rollDie(num)}.`);
      }
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
          let confirmed = false;
          const thing = discord_client.on('message', msg => {
            if (!confirmed) {
              if(msg.content.toLowerCase() === 'yes') {
                confirmed = true;
                message.channel.send("Well, I can't save this yet so too bad.");
              }
              else if (msg.content.toLowerCase() === 'no') {
                confirmed = true;
                message.channel.send("Hah, it would have been a waste of time anyway.");
              }
            }
          })
          .setTimeout(() => {
            if (!confirmed) {
              message.channel.send("I will not tolerate you wasting my time. Your pathetic event has been cancelled!");
            }
          }, 10000);
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
      throw new Error();
    });
  return {server, db, discord_client};
}
