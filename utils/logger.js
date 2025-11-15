import pino from 'pino'

const pinoTransport = pino.transport({
  target: 'pino-pretty',
  options: {
    colorize: true,
    translateTime: 'SYS:standard',
    ignore: 'pid,hostname',
    singleLine: false,
  },
})

export const logger = pino(pinoTransport)
