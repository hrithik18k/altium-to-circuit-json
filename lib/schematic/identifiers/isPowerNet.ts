import { isGroundNet } from "./isGroundNet"

export function isPowerNet(name: string): boolean {
  return (
    isGroundNet(name) ||
    /(?:^|[_+-])(?:vcc|vdd|vss)(?:$|[a-z0-9_+-])/iu.test(name) ||
    /(?:^|[_+-])(?:vin|vout|pwr|power)(?:$|[_+\d-])/iu.test(name)
  )
}
