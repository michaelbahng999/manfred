import * as express from 'express';
import { init, PORT } from './app';
import { log } from 'winston';

const app = init();

const api_v1 = express.Router();
api_v1.get('/health', (req, res) => {
  res.send({status: 'UP'});
});

const users_router = express.Router();
users_router.get('/', (req, res) => {
  return app.db.select().from('users').orderBy('created_at').limit(10)
    .then(data => res.status(200).json(data))
    .catch(error => res.json(error));
});
users_router.get('/:uid', (req, res) => {
  // Validation
  req.checkParams('uid', 'Invalid UID.').isUUID();

  return app.db.select().from('users').where({uid: req.params.uid})
    .then(data => {
      if (data.length > 1) {
        return res.status(500);
      }
      return res.status(200).json(data);
    })
    .catch(error => res.status(400).json(error));
})
api_v1.use('/users', users_router);

app.server.use('/api/v1', api_v1);
log('info', `Port is ${PORT}`);
app.server.listen(PORT, () => {
  log('info', `Server started on port ${PORT}`);
});
