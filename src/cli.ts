import { runExit } from 'clipanion'
import { WatchCommand } from './commands/WatchCommand.ts'
import { RepublishCommand } from './commands/RepublishCommand.ts'
import { LoginCommand } from './commands/LoginCommand.ts'
import { TokenCommand } from './commands/TokenCommand.ts'
import { WaitForRegistryCommand } from './commands/WaitForRegistryCommand.ts'

runExit([
  LoginCommand,
  TokenCommand,
  RepublishCommand,
  WaitForRegistryCommand,
  WatchCommand,
])
