import { runExit } from 'clipanion'
import { WatchCommand } from './commands/WatchCommand.js'
import { RepublishCommand } from './commands/RepublishCommand.js'
import { LoginCommand } from './commands/LoginCommand.js'
import { TokenCommand } from './commands/TokenCommand.js'
import { WaitForRegistryCommand } from './commands/WaitForRegistryCommand.js'
import { StartCommand } from './commands/StartCommand.js'
import { InitCommand } from './commands/InitCommand.js'

runExit([
  InitCommand,
  LoginCommand,
  TokenCommand,
  RepublishCommand,
  StartCommand,
  WaitForRegistryCommand,
  WatchCommand,
])
