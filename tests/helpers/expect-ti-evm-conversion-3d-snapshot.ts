import { expect } from "bun:test"
import { mkdir, readFile, writeFile } from "node:fs/promises"
import { basename, dirname, join } from "node:path"
import { parseAltiumBinaryPcbDoc } from "altiumts"
import type { CadComponent, CircuitJson, PcbBoard } from "circuit-json"
import {
  convertCircuitJsonToGltf,
  getBestCameraPosition,
} from "circuit-json-to-gltf"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { readReferenceBytes } from "./read-reference"

type EmbeddedModelIndex = number
type BoardViewName = "bottom" | "top"

const TOP_BOARD_CAMERA_DIRECTION = [-0.7, 1.2, -0.8] as const
const BOTTOM_BOARD_CAMERA_DIRECTION = [-0.7, -1.2, -0.8] as const

function getEmbeddedModelIndex(cadComponent: CadComponent): EmbeddedModelIndex {
  const modelStepUrl = cadComponent.model_step_url
  const match = modelStepUrl?.match(/\/(?<modelIndex>\d+)\.step$/u)
  const modelIndex = match?.groups?.modelIndex
  if (!modelIndex) {
    throw new Error(
      `${cadComponent.cad_component_id} has no indexed embedded STEP model URL`,
    )
  }
  return Number(modelIndex)
}

async function replaceStepUrlsWithEmbeddedModelData({
  circuitJson,
  pcbFilename,
}: {
  circuitJson: CircuitJson
  pcbFilename: string
}): Promise<CircuitJson> {
  const document = parseAltiumBinaryPcbDoc(
    await readReferenceBytes(pcbFilename),
  )
  const referencedModelIndexes = new Set(
    circuitJson.flatMap((element) =>
      element.type === "cad_component" ? [getEmbeddedModelIndex(element)] : [],
    ),
  )
  const embeddedStepModelUrlByModelIndex = new Map<EmbeddedModelIndex, string>()
  await Promise.all(
    document.embeddedModels.flatMap((embeddedModel) =>
      referencedModelIndexes.has(embeddedModel.index)
        ? [
            embeddedModel.getDecompressedBytes().then((modelBytes) => {
              embeddedStepModelUrlByModelIndex.set(
                embeddedModel.index,
                `data:application/step;base64,${Buffer.from(modelBytes).toString("base64")}`,
              )
            }),
          ]
        : [],
    ),
  )

  return circuitJson.map((element) => {
    if (element.type !== "cad_component") return element
    const embeddedModelIndex = getEmbeddedModelIndex(element)
    const modelStepUrl =
      embeddedStepModelUrlByModelIndex.get(embeddedModelIndex)
    if (!modelStepUrl) {
      throw new Error(
        `Could not resolve embedded STEP model ${embeddedModelIndex} from ${pcbFilename}`,
      )
    }
    return { ...element, model_step_url: modelStepUrl } satisfies CadComponent
  })
}

async function renderBoardView({
  boardViewName,
  glb,
  pcbBoard,
}: {
  boardViewName: BoardViewName
  glb: ArrayBuffer
  pcbBoard: PcbBoard
}): Promise<Uint8Array> {
  const direction =
    boardViewName === "top"
      ? TOP_BOARD_CAMERA_DIRECTION
      : BOTTOM_BOARD_CAMERA_DIRECTION
  return renderGLTFToPNGFromGLB(glb, {
    ...getBestCameraPosition([pcbBoard], {
      aspectRatio: 4 / 3,
      direction,
    }),
    backgroundColor: "#07100c",
    height: 750,
    width: 1000,
  })
}

async function expectPngSnapshot({
  renderedPng,
  snapshotPath,
}: {
  renderedPng: Uint8Array
  snapshotPath: string
}): Promise<void> {
  const shouldUpdate =
    process.env.BUN_UPDATE_SNAPSHOTS === "1" ||
    process.env.BUN_FORCE_UPDATE_SNAPSHOTS === "1"

  if (shouldUpdate) {
    await mkdir(dirname(snapshotPath), { recursive: true })
    await writeFile(snapshotPath, renderedPng)
  }

  expect(await Bun.file(snapshotPath).exists()).toBe(true)
  expect(renderedPng).toEqual(new Uint8Array(await readFile(snapshotPath)))
}

export async function expectTiEvmConversion3dSnapshot({
  circuitJson,
  pcbFilename,
  testPath,
}: {
  circuitJson: CircuitJson
  pcbFilename: string
  testPath: string
}): Promise<void> {
  const pcbBoard = circuitJson.find(
    (element): element is PcbBoard => element.type === "pcb_board",
  )
  if (!pcbBoard) throw new Error("Could not find PCB board")

  const visualCircuitJson = await replaceStepUrlsWithEmbeddedModelData({
    circuitJson,
    pcbFilename,
  })
  const glb = await convertCircuitJsonToGltf(visualCircuitJson, {
    boardTextureResolution: 1024,
    format: "glb",
  })
  if (!(glb instanceof ArrayBuffer)) {
    throw new Error("3D conversion did not return a GLB")
  }

  const testName = basename(testPath).replace(/\.test\.tsx?$/u, "")
  for (const boardViewName of ["top", "bottom"] as const) {
    const renderedPng = await renderBoardView({
      boardViewName,
      glb,
      pcbBoard,
    })
    await expectPngSnapshot({
      renderedPng,
      snapshotPath: join(
        dirname(testPath),
        "__snapshots__",
        `${testName}-${boardViewName}-3d.snap.png`,
      ),
    })
  }
}
