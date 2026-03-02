export class Claw402Error extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string
  ) {
    super(`Claw402 API error ${status}: ${body}`)
    this.name = "Claw402Error"
  }
}
