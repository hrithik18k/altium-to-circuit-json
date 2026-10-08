import { AltiumBinaryPcbDoc, AltiumComponentBodyRecord } from "altiumts"
import type { CadComponent, PcbBoard } from "circuit-json"
import { toMillimeterPoint } from "../geometry"
import type { PcbConversionContext } from "../model"
import { getBoardFrameModelCcwRotationDegrees } from "./getBoardFrameModelCcwRotationDegrees"
import { getCadModelLayer } from "./getCadModelLayer"

const DEFAULT_PCB_THICKNESS_MM = 1.6

export function createPcbCadModels(
  context: PcbConversionContext,
): CadComponent[] {
  const document = context.document
  if (!(document instanceof AltiumBinaryPcbDoc)) return []
  const resolveEmbeddedModelUrl = context.options.resolveEmbeddedModelUrl
  if (!resolveEmbeddedModelUrl) return []
  const pcbBoard = context.elements.find(
    (element): element is PcbBoard => element.type === "pcb_board",
  )

  return document.componentBodies.flatMap((body, bodyIndex) => {
    if (!(body instanceof AltiumComponentBodyRecord)) return []
    const modelPosition = body.modelPosition
    const componentIndex = body.componentIndex
    if (!modelPosition || componentIndex === undefined) return []

    const embeddedModel = document.getEmbeddedModelForComponentBody(body)
    if (!embeddedModel) return []
    const modelStepUrl = resolveEmbeddedModelUrl({ embeddedModel })
    if (!modelStepUrl) return []

    const pcbComponentId = context.componentContext.getPcbComponentId(body)
    const component = document.getComponentForRecord(body)
    if (!pcbComponentId || !component) return []

    const layer = getCadModelLayer({ body, componentSide: component.side })
    const modelZOffsetMillimeters =
      body.getAltiumMeasurement("MODEL.3D.DZ")?.toMillimeters() ?? 0
    const boardSurfaceZ = (pcbBoard?.thickness ?? DEFAULT_PCB_THICKNESS_MM) / 2
    const positionZ =
      layer === "bottom"
        ? -boardSurfaceZ - modelZOffsetMillimeters
        : boardSurfaceZ + modelZOffsetMillimeters

    return [
      {
        type: "cad_component",
        cad_component_id: `cad_component_altium_${bodyIndex}`,
        pcb_component_id: pcbComponentId,
        source_component_id: `source_component_altium_${componentIndex}`,
        position: { ...toMillimeterPoint(modelPosition), z: positionZ },
        rotation: getBoardFrameModelCcwRotationDegrees({ body, layer }),
        layer,
        model_step_url: modelStepUrl,
        model_unit_to_mm_scale_factor: 1,
        model_board_normal_direction: "z+",
        model_origin_position: { x: 0, y: 0, z: 0 },
        model_object_fit: "contain_within_bounds",
        anchor_alignment: "center",
        ...(body.opacity !== undefined && body.opacity < 1
          ? { show_as_translucent_model: true }
          : {}),
      } satisfies CadComponent,
    ]
  })
}
