import { expect, test } from "bun:test"
import { readdirSync } from "node:fs"
import { basename, join } from "node:path"
import ts from "typescript"

test("keeps one same-named top-level function or class per source file", async () => {
  const pendingDirectories = [join(import.meta.dir, "../../lib")]
  const sourceFiles: string[] = []

  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop()
    if (!directory) continue
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name)
      if (entry.isDirectory()) pendingDirectories.push(entryPath)
      else if (entry.name.endsWith(".ts")) sourceFiles.push(entryPath)
    }
  }

  for (const sourcePath of sourceFiles) {
    const sourceText = await Bun.file(sourcePath).text()
    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    )
    const declarationNames = sourceFile.statements.flatMap((statement) => {
      if (
        (ts.isFunctionDeclaration(statement) ||
          ts.isClassDeclaration(statement)) &&
        statement.name
      ) {
        return [statement.name.text]
      }
      return []
    })
    if (declarationNames.length === 0) continue

    expect(declarationNames, sourcePath).toHaveLength(1)
    const declarationName = declarationNames[0]
    if (!declarationName)
      throw new Error(`Missing declaration in ${sourcePath}`)
    expect(basename(sourcePath, ".ts"), sourcePath).toBe(declarationName)
    expect(basename(sourcePath), sourcePath).not.toContain("-")
  }
})
