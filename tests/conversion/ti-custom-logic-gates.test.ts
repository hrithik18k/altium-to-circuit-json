import { expect, test } from "bun:test"
import { parseAltiumSchDoc } from "altiumts"
import { type AnyCircuitElement, any_circuit_element } from "circuit-json"
import { convertCircuitJsonToSchematicSvg } from "circuit-to-svg"
import { convertAltiumSchDocToCircuitJson } from "../../lib"
import { TI_TMDS62LEVM_FIXTURE_NAME } from "../../scripts/references/reference-manifest"
import { readReferenceBytes } from "../helpers/read-reference"

type SchematicComponent = Extract<
  AnyCircuitElement,
  { type: "schematic_component" }
>
type SourceComponent = Extract<AnyCircuitElement, { type: "source_component" }>
type SchematicPath = Extract<AnyCircuitElement, { type: "schematic_path" }>
type SchematicText = Extract<AnyCircuitElement, { type: "schematic_text" }>

test("uses independent IEC logic symbols with original terminals and pin labels", async () => {
  const source = await readReferenceBytes(
    `${TI_TMDS62LEVM_FIXTURE_NAME}/13.SchDoc`,
  )
  const circuitJson = convertAltiumSchDocToCircuitJson(
    parseAltiumSchDoc(source),
  )
  const gateSources = circuitJson.filter(
    (element): element is SourceComponent =>
      element.type === "source_component" &&
      (element.name === "U57" || element.name === "U58"),
  )
  const gateSourceIds = new Set(
    gateSources.flatMap((element) =>
      element.source_component_id ? [element.source_component_id] : [],
    ),
  )
  const gateComponents = circuitJson.filter(
    (element): element is SchematicComponent =>
      element.type === "schematic_component" &&
      element.source_component_id !== undefined &&
      gateSourceIds.has(element.source_component_id),
  )

  expect(gateComponents).toHaveLength(2)
  expect(
    gateComponents.every(
      (component) =>
        component.is_box_with_pins === false &&
        component.symbol_name === undefined,
    ),
  ).toBe(true)
  expect(
    gateComponents.every((component) =>
      circuitJson.some(
        (element) =>
          (element.type === "schematic_path" ||
            element.type === "schematic_rect") &&
          element.schematic_component_id === component.schematic_component_id,
      ),
    ),
  ).toBe(true)
  const componentForName = (name: string) => {
    const source = gateSources.find((element) => element.name === name)
    return gateComponents.find(
      (component) =>
        component.source_component_id === source?.source_component_id,
    )
  }
  const pathsForComponent = (component: SchematicComponent | undefined) =>
    circuitJson.filter(
      (element): element is SchematicPath =>
        element.type === "schematic_path" &&
        element.schematic_component_id === component?.schematic_component_id,
    )
  for (const [name, legend] of [
    ["U57", "\u22651"],
    ["U58", "&"],
  ]) {
    const component = componentForName(name!)
    expect(pathsForComponent(component)).toHaveLength(0)
    const owned = circuitJson.filter(
      (element) =>
        "schematic_component_id" in element &&
        element.schematic_component_id === component?.schematic_component_id,
    )
    expect(
      owned.filter(
        (element) =>
          element.type === "schematic_rect" &&
          element.schematic_rect_id.startsWith("compatibility_frame_"),
      ),
    ).toHaveLength(1)
    expect(
      owned.find(
        (element) =>
          element.type === "schematic_text" && element.text === legend,
      ),
    ).toMatchObject({ color: "#0f0f0f" })
  }

  const numericPinDesignators = circuitJson.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id.startsWith(
        "schematic_pin_designator_altium_",
      ) &&
      /^[1-5]$/.test(element.text),
  )
  expect(numericPinDesignators).toHaveLength(10)
  expect(
    numericPinDesignators.every(
      (element) =>
        element.schematic_component_id !== undefined &&
        gateComponents.some(
          (component) =>
            component.schematic_component_id === element.schematic_component_id,
        ),
    ),
  ).toBe(true)

  const schematicSvg = convertCircuitJsonToSchematicSvg(circuitJson)
  for (const pin of ["1", "2", "3", "4", "5"]) {
    const renderedPinLabels = schematicSvg.match(
      new RegExp(
        `<text class="sch-text"[^>]*fill="#a90000"[^>]*>${pin}</text>`,
        "g",
      ),
    )
    expect(renderedPinLabels).toHaveLength(2)
  }
  expect(
    circuitJson.every(
      (element) => any_circuit_element.safeParse(element).success,
    ),
  ).toBe(true)
})
