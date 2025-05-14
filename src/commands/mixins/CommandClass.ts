import type { Command } from 'clipanion'

export type CommandClass = abstract new (...args: any[]) => Command
