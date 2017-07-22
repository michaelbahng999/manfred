import * as moment from 'moment';
const sherlock = require('sherlockjs');

export interface Event {
  isAllDay: boolean;
  eventTitle: string;
  startDate?: Date;
  endDate?: Date;
};

export function parseEventString(eventString: string): Event {
  return sherlock.parse(eventString);
}
