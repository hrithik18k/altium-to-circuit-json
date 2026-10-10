import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import type { AnyCircuitElement } from "circuit-json"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { TI_EVM_REFERENCE_FILENAMES } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>
type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>

test("preserves rich TI transformer, optocoupler, and MOSFET bodies", async () => {
  const lm5155 = await convertReference(
    TI_EVM_REFERENCE_FILENAMES.lm5155EvmFly.schematic,
  )
  const lm251772 = await convertReference(
    TI_EVM_REFERENCE_FILENAMES.lm251772EvmPd.schematic,
  )

  const transformer = findComponent(lm5155, "T1")
  expect(transformer.is_box_with_pins).toBe(false)
  expect(transformer.symbol_name).toBeUndefined()
  expect(
    ownedElements({
      circuitJson: lm5155,
      component: transformer,
      type: "schematic_path",
    }),
  ).toHaveLength(32)

  const optocoupler = findComponent(lm5155, "U2")
  expect(optocoupler.is_box_with_pins).toBe(false)
  expect(optocoupler.symbol_name).toBeUndefined()
  expect(
    ownedElements({
      circuitJson: lm5155,
      component: optocoupler,
      type: "schematic_path",
    }),
  ).toHaveLength(10)

  for (const name of ["Q2", "Q7"]) {
    const mosfet = findComponent(lm251772, name)
    expect(mosfet.symbol_name).toMatch(/channel_.*mosfet_transistor_gate_/)
    expect(
      ownedElements({
        circuitJson: lm251772,
        component: mosfet,
        type: "schematic_circle",
      }),
    ).toHaveLength(0)
  }

  expect(findComponent(lm5155, "U1").is_box_with_pins).toBe(true)
  expect(findComponent(lm251772, "U1").is_box_with_pins).toBe(true)
})

async function convertReference(
  filename: string,
): Promise<AnyCircuitElement[]> {
  return convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(await readReferenceBytes(filename)),
  )
}

function findComponent(
  circuitJson: AnyCircuitElement[],
  name: string,
): SchematicComponent {
  const sourceComponent = circuitJson.find(
    (element): element is SourceComponent =>
      element.type === "source_component" && element.name === name,
  )
  const component = circuitJson.find(
    (element): element is SchematicComponent =>
      element.type === "schematic_component" &&
      element.source_component_id === sourceComponent?.source_component_id,
  )
  if (!component) throw new Error(`Missing schematic component ${name}`)
  return component
}

function ownedElements({
  circuitJson,
  component,
  type,
}: {
  circuitJson: AnyCircuitElement[]
  component: SchematicComponent
  type: AnyCircuitElement["type"]
}): AnyCircuitElement[] {
  return circuitJson.filter(
    (element) =>
      element.type === type &&
      "schematic_component_id" in element &&
      element.schematic_component_id === component.schematic_component_id,
  )
}
