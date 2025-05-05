import { runExit } from 'clipanion'
import { WatchCommand } from './commands/WatchCommand.ts'
import { RepublishCommand } from './commands/RepublishCommand.ts'

runExit([RepublishCommand, WatchCommand])
