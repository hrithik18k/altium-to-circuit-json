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

test("preserves custom TI logic-gate bodies instead of generic boxes", async () => {
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
  const u57 = componentForName("U57")
  const u57Paths = pathsForComponent(u57)
  expect(u57Paths).toHaveLength(4)
  expect(
    u57Paths.every((path) =>
      path.points.every(
        (point) =>
          u57 !== undefined &&
          point.y >= u57.center.y - u57.size.height / 2 - 0.001 &&
          point.y <= u57.center.y + u57.size.height / 2 + 0.001,
      ),
    ),
  ).toBe(true)

  const u58Paths = pathsForComponent(componentForName("U58"))
  expect(u58Paths).toHaveLength(1)
  const u58Path = u58Paths[0]!
  const endpointMaximumX = Math.max(
    u58Path.points[0]!.x,
    u58Path.points.at(-1)!.x,
  )
  expect(Math.max(...u58Path.points.map((point) => point.x))).toBeGreaterThan(
    endpointMaximumX + 0.1,
  )

  const numericPinDesignators = circuitJson.filter(
    (element): element is SchematicText =>
      element.type === "schematic_text" &&
      element.schematic_text_id.startsWith(
        "schematic_pin_designator_altium_",
      ) &&
      /^[1-5]$/.test(element.text) &&
      gateComponents.some(
        (component) =>
          component.schematic_component_id === element.schematic_component_id,
      ),
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

  const schematicSvg = convertCircuitJsonToSchematicSvg(
    circuitJson.filter(
      (element) =>
        element.type === "schematic_sheet" ||
        (element.type === "source_component" &&
          gateSourceIds.has(element.source_component_id)) ||
        ("schematic_component_id" in element &&
          gateComponents.some(
            (component) =>
              component.schematic_component_id ===
              element.schematic_component_id,
          )),
    ),
  )
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
