import * as express from 'express';
import * as body_parser from 'body-parser';
import * as connection from 'knex';
import * as express_validator from 'express-validator';

import {Client} from 'discord.js';

const discord = new Client();

import { log } from 'winston';

const app = express();
const PORT = 3000;

const knex = connection({
  client: 'pg',
  connection: {
    host: '192.168.99.100',
    port: 5432,
    user: 'username',
    password: 'password',
    database: 'alfred_dev_db',
  },
  pool: { min: 2, max: 10 },
  debug: true,
});

app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(express_validator());
app.disable('etag');


app.get('/', (req, res) => {
  res.send({'hello': 'world'});
});

const api_v1 = express.Router();
api_v1.get('/health', (req, res) => {
  res.send({status: 'UP'});
});

const users_router = express.Router();
users_router.get('/', (req, res) => {
  return knex.select().from('users').orderBy('created_at').limit(10)
    .then(data => res.status(200).json(data))
    .catch(error => res.json(error));
});
users_router.get('/:uid', (req, res) => {
  // Validation
  req.checkParams('uid', 'Invalid UID.').isUUID();

  return knex.select().from('users').where({uid: req.params.uid})
    .then(data => {
      if (data.length > 1) {
        return res.status(500);
      }
      return res.status(200).json(data);
    })
    .catch(error => res.status(400).json(error));
})
api_v1.use('/users', users_router);

app.use('/api/v1', api_v1);
app.listen(PORT, () => {
  log('info', `Server started on port ${PORT}`);
});
