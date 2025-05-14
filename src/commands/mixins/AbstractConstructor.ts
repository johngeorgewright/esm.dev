import type { Command } from 'clipanion'

export type AbstractConstructor = abstract new (...args: any[]) => Command
