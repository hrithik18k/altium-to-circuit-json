export function isGroundNet(name: string): boolean {
  return /(?:^|[_+-])(?:[adp]?gnd|ground)(?:$|[_+\d-])/iu.test(name)
}
