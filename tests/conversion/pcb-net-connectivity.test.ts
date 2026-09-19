import { expect, test } from "bun:test"
import { parseAltiumPcbDoc } from "altiumts"
import { any_circuit_element } from "circuit-json"
import { convertAltiumPcbDocToCircuitJson } from "../../lib"

test("preserves Altium PCB net identities on routed copper", () => {
  const document = parseAltiumPcbDoc(
    [
      "|RECORD=Board|VERSION=5.0|KIND0=0|VX0=0mil|VY0=0mil|KIND1=0|VX1=500mil|VY1=0mil|KIND2=0|VX2=500mil|VY2=500mil|KIND3=0|VX3=0mil|VY3=500mil|KIND4=0|VX4=0mil|VY4=0mil",
      "|RECORD=Net|NAME=POWER_RAIL",
      "|RECORD=Net|NAME=SENSE",
      "|RECORD=Track|LAYER=TOP|NET=0|X1=50mil|Y1=100mil|X2=250mil|Y2=100mil|WIDTH=10mil",
      "|RECORD=Arc|LAYER=BOTTOM|NET=1|LOCATION.X=250mil|LOCATION.Y=250mil|RADIUS=50mil|STARTANGLE=0|ENDANGLE=90|WIDTH=8mil",
      "|RECORD=Via|NET=1|X=250mil|Y=300mil|DIAMETER=40mil|HOLESIZE=20mil|STARTLAYER=TOP|ENDLAYER=BOTTOM",
      "|RECORD=Region|LAYER=TOP|NET=0|REGIONKIND=COPPER|KIND0=0|VX0=300mil|VY0=50mil|KIND1=0|VX1=450mil|VY1=50mil|KIND2=0|VX2=450mil|VY2=150mil|KIND3=0|VX3=300mil|VY3=150mil|KIND4=0|VX4=300mil|VY4=50mil",
    ].join("\n"),
  )

  const circuitJson = convertAltiumPcbDocToCircuitJson(document)
  const nets = circuitJson.filter((element) => element.type === "source_net")
  const traces = circuitJson.filter(
    (element) => element.type === "source_trace",
  )
  const pcbTraces = circuitJson.filter(
    (element) => element.type === "pcb_trace",
  )
  const via = circuitJson.find((element) => element.type === "pcb_via")
  const pour = circuitJson.find((element) => element.type === "pcb_copper_pour")

  expect(nets).toMatchObject([
    { source_net_id: "source_net_altium_pcb_0", name: "POWER_RAIL" },
    { source_net_id: "source_net_altium_pcb_1", name: "SENSE" },
  ])
  expect(traces).toMatchObject([
    {
      source_trace_id: "source_trace_altium_pcb_0",
      connected_source_net_ids: ["source_net_altium_pcb_0"],
    },
    {
      source_trace_id: "source_trace_altium_pcb_1",
      connected_source_net_ids: ["source_net_altium_pcb_1"],
    },
  ])
  expect(pcbTraces).toMatchObject([
    { source_trace_id: "source_trace_altium_pcb_0" },
    { source_trace_id: "source_trace_altium_pcb_1" },
  ])
  expect(via).toMatchObject({
    source_net_id: "source_net_altium_pcb_1",
    source_trace_id: "source_trace_altium_pcb_1",
  })
  expect(pour).toMatchObject({ source_net_id: "source_net_altium_pcb_0" })
  expect(
    circuitJson.every(
      (element) => any_circuit_element.safeParse(element).success,
    ),
  ).toBe(true)
})
