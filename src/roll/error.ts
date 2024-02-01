export class InvalidCommandError extends Error {
  static {
    this.prototype.name = 'InvalidCommandError'
  }

  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}
