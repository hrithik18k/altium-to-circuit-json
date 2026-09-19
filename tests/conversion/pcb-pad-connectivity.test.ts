import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { any_circuit_element } from "circuit-json"
import { getFullConnectivityMapFromCircuitJson } from "circuit-json-to-connectivity-map"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

test("connects Altium component pads to their source nets", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board|VERSION=5.0|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil",
      "|RECORD=Component|DESIGNATOR=U1|PATTERN=QFN|X=100mil|Y=100mil|LAYER=TOP",
      "|RECORD=Net|NAME=VCC",
      "|RECORD=Pad|NAME=1|COMPONENT=0|NET=0|LAYER=TOP|X=100mil|Y=100mil|XSIZE=40mil|YSIZE=30mil|SHAPE=RECTANGLE",
      "|RECORD=Pad|NAME=1|COMPONENT=0|NET=0|LAYER=TOP|X=150mil|Y=100mil|XSIZE=40mil|YSIZE=30mil|SHAPE=RECTANGLE",
      "|RECORD=Track|LAYER=TOP|NET=0|X1=100mil|Y1=100mil|X2=300mil|Y2=100mil|WIDTH=10mil",
    ].join("\n"),
  )

  const circuitJson = convertAltiumPcbDocToCircuitJson(document)
  const sourceComponents = circuitJson.filter(
    (element) => element.type === "source_component",
  )
  const sourcePorts = circuitJson.filter(
    (element) => element.type === "source_port",
  )
  const pcbPorts = circuitJson.filter((element) => element.type === "pcb_port")
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  const sourceTrace = circuitJson.find(
    (element) => element.type === "source_trace",
  )
  const connectivityMap = getFullConnectivityMapFromCircuitJson(circuitJson)

  expect(sourceComponents).toMatchObject([
    {
      source_component_id: "source_component_altium_0",
      ftype: "simple_chip",
      name: "U1",
    },
  ])
  expect(sourcePorts).toMatchObject([
    {
      source_port_id: "source_port_altium_pcb_3",
      source_component_id: "source_component_altium_0",
      name: "1",
      pin_number: 1,
    },
  ])
  expect(pcbPorts).toHaveLength(2)
  expect(pads).toMatchObject([
    {
      pcb_component_id: "pcb_component_altium_0",
      pcb_port_id: "pcb_port_altium_3",
    },
    {
      pcb_component_id: "pcb_component_altium_0",
      pcb_port_id: "pcb_port_altium_4",
    },
  ])
  expect(sourceTrace).toMatchObject({
    connected_source_port_ids: ["source_port_altium_pcb_3"],
    connected_source_net_ids: ["source_net_altium_pcb_0"],
  })
  for (const pad of pads) {
    expect(
      connectivityMap.areIdsConnected(
        pad.pcb_smtpad_id,
        "source_net_altium_pcb_0",
      ),
    ).toBe(true)
  }
  expect(
    circuitJson.every(
      (element) => any_circuit_element.safeParse(element).success,
    ),
  ).toBe(true)
})
