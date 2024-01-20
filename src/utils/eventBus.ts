import mitt from 'mitt';

export interface EventTypes {
  newMsg: Mess,
  startLog: boolean,
  stopLog: boolean,
  reStart: boolean,
}

const emitter = mitt();

export default emitter;

