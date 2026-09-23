import { expect, test } from "bun:test"
import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import ts from "typescript"

test("enforces the tscircuit handbook conventions", () => {
  const libraryDirectory = join(import.meta.dir, "../../lib")
  const pendingDirectories = [libraryDirectory]
  const sourcePaths: string[] = []
  while (pendingDirectories.length > 0) {
    const directory = pendingDirectories.pop()
    if (!directory) continue
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const entryPath = join(directory, entry.name)
      if (entry.isDirectory()) pendingDirectories.push(entryPath)
      else if (entry.name.endsWith(".ts")) sourcePaths.push(entryPath)
    }
  }

  const findings: string[] = []
  const sourcePathByText = new Map<string, string>()
  for (const sourcePath of sourcePaths) {
    const sourceText = readFileSync(sourcePath, "utf8")
    const displayPath = relative(libraryDirectory, sourcePath)
    const sourceLineCount = sourceText.split(/\r?\n/u).length
    if (sourceLineCount > 160) {
      findings.push(`${displayPath}: file has ${sourceLineCount} lines`)
    }
    const duplicatePath = sourcePathByText.get(sourceText)
    if (duplicatePath) {
      findings.push(
        `${displayPath}: duplicates ${relative(libraryDirectory, duplicatePath)}`,
      )
    } else {
      sourcePathByText.set(sourceText, sourcePath)
    }

    const sourceFile = ts.createSourceFile(
      sourcePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    )
    const pendingNodes: ts.Node[] = [sourceFile]
    while (pendingNodes.length > 0) {
      const node = pendingNodes.pop()
      if (!node) continue
      const location = sourceFile.getLineAndCharacterOfPosition(
        node.getStart(sourceFile),
      )
      const displayLocation = `${displayPath}:${location.line + 1}`
      const isFunctionLike =
        ts.isFunctionDeclaration(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isConstructorDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isGetAccessorDeclaration(node) ||
        ts.isSetAccessorDeclaration(node)
      if (isFunctionLike && node.parameters.length > 2) {
        findings.push(
          `${displayLocation}: function has ${node.parameters.length} parameters`,
        )
      }
      if (isFunctionLike) {
        let parent = node.parent
        let hasFunctionAncestor = false
        while (parent) {
          if (
            ts.isFunctionDeclaration(parent) ||
            ts.isMethodDeclaration(parent) ||
            ts.isConstructorDeclaration(parent) ||
            ts.isFunctionExpression(parent) ||
            ts.isArrowFunction(parent)
          ) {
            hasFunctionAncestor = true
            break
          }
          parent = parent.parent
        }
        const isNamedClosure =
          hasFunctionAncestor &&
          ((ts.isFunctionDeclaration(node) && Boolean(node.name)) ||
            ((ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
              ts.isVariableDeclaration(node.parent) &&
              ts.isIdentifier(node.parent.name)))
        if (isNamedClosure) {
          findings.push(`${displayLocation}: named closure`)
        }
      }
      if (
        ts.isAsExpression(node) &&
        (node.type.kind === ts.SyntaxKind.AnyKeyword ||
          node.type.kind === ts.SyntaxKind.UnknownKeyword)
      ) {
        findings.push(`${displayLocation}: unsafe type assertion`)
      }
      if (
        ts.isTypeReferenceNode(node) &&
        ts.isIdentifier(node.typeName) &&
        (node.typeName.text === "Map" ||
          node.typeName.text === "ReadonlyMap") &&
        node.typeArguments?.[0]?.kind === ts.SyntaxKind.StringKeyword
      ) {
        findings.push(`${displayLocation}: string map key`)
      }
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === "Math" &&
        (node.expression.name.text === "sin" ||
          node.expression.name.text === "cos")
      ) {
        findings.push(`${displayLocation}: handwritten rotation math`)
      }
      if (
        ts.isBinaryExpression(node) &&
        (node.operatorToken.kind === ts.SyntaxKind.AsteriskToken ||
          node.operatorToken.kind === ts.SyntaxKind.SlashToken)
      ) {
        const expressionNodes: ts.Node[] = [node.left, node.right]
        let containsScaleIdentifier = false
        while (expressionNodes.length > 0) {
          const expressionNode = expressionNodes.pop()
          if (!expressionNode) continue
          if (
            ts.isIdentifier(expressionNode) &&
            /(?:^scale$|Scale$)/u.test(expressionNode.text)
          ) {
            containsScaleIdentifier = true
          }
          expressionNode.forEachChild((child) => expressionNodes.push(child))
        }
        if (containsScaleIdentifier) {
          findings.push(`${displayLocation}: handwritten scaling math`)
        }
      }
      if (ts.isIdentifier(node)) {
        const parent = node.parent
        const isDeclaration =
          (ts.isVariableDeclaration(parent) && parent.name === node) ||
          (ts.isParameter(parent) && parent.name === node) ||
          (ts.isPropertyDeclaration(parent) && parent.name === node) ||
          (ts.isPropertySignature(parent) && parent.name === node) ||
          (ts.isFunctionDeclaration(parent) && parent.name === node) ||
          (ts.isMethodDeclaration(parent) && parent.name === node) ||
          (ts.isClassDeclaration(parent) && parent.name === node) ||
          (ts.isInterfaceDeclaration(parent) && parent.name === node) ||
          (ts.isTypeAliasDeclaration(parent) && parent.name === node)
        const identifierWords = node.text
          .replace(/([a-z0-9])([A-Z])/gu, "$1_$2")
          .toLowerCase()
          .split("_")
        const containsBannedWord = identifierWords.some((word) =>
          ["data", "info", "value", "values", "param", "params"].includes(word),
        )
        if (isDeclaration && containsBannedWord) {
          findings.push(`${displayLocation}: banned identifier ${node.text}`)
        }
        if (isDeclaration && node.text === "rotation") {
          findings.push(`${displayLocation}: rotation lacks direction and unit`)
        }
        if (
          isDeclaration &&
          ["mat", "matrix", "transform"].includes(node.text.toLowerCase())
        ) {
          findings.push(`${displayLocation}: transform lacks coordinate spaces`)
        }
      }
      node.forEachChild((child) => pendingNodes.push(child))
    }
  }

  expect(findings).toEqual([])
})
