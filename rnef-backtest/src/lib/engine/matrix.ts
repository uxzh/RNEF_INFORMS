import { Matrix, EigenvalueDecomposition, solve as mlSolve } from 'ml-matrix'

// ---- vector ops ----

export function dot(a: number[], b: number[]): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

export function norm1(v: number[]): number {
  let s = 0
  for (let i = 0; i < v.length; i++) s += Math.abs(v[i])
  return s
}

export function clip(v: number[], lo: number, hi: number): number[] {
  return v.map(x => Math.min(Math.max(x, lo), hi))
}

export function vecSub(a: number[], b: number[]): number[] {
  return a.map((v, i) => v - b[i])
}

export function vecAdd(a: number[], b: number[]): number[] {
  return a.map((v, i) => v + b[i])
}

export function vecScale(v: number[], s: number): number[] {
  return v.map(x => x * s)
}

// ---- matrix-vector ops ----

// matrix (rows x cols) times vector (cols) -> vector (rows)
export function matVecMul(A: number[][], v: number[]): number[] {
  return A.map(row => dot(row, v))
}

// w^T * A * w  (quadratic form, scalar result)
export function vecMatVec(v: number[], A: number[][]): number {
  return dot(v, matVecMul(A, v))
}

// ---- statistics ----

export function mean(arr: number[]): number {
  let s = 0
  for (const x of arr) s += x
  return s / arr.length
}

export function colMeans(data: number[][]): number[] {
  const nRows = data.length
  const nCols = data[0].length
  const means = new Array(nCols).fill(0)
  for (let r = 0; r < nRows; r++)
    for (let c = 0; c < nCols; c++) means[c] += data[r][c]
  for (let c = 0; c < nCols; c++) means[c] /= nRows
  return means
}

export function colStd(data: number[][]): number[] {
  const nRows = data.length
  const means = colMeans(data)
  const nCols = data[0].length
  const vars = new Array(nCols).fill(0)
  for (let r = 0; r < nRows; r++)
    for (let c = 0; c < nCols; c++) vars[c] += (data[r][c] - means[c]) ** 2
  // sample std (ddof=1, matching pandas default)
  return vars.map(v => Math.sqrt(v / (nRows - 1)))
}

// sample covariance matrix (ddof=1, matches pandas .cov())
export function covMatrix(data: number[][]): number[][] {
  const nRows = data.length
  const nCols = data[0].length
  const means = colMeans(data)
  const cov: number[][] = Array.from({ length: nCols }, () => new Array(nCols).fill(0))
  for (let r = 0; r < nRows; r++)
    for (let i = 0; i < nCols; i++)
      for (let j = i; j < nCols; j++) {
        const v = (data[r][i] - means[i]) * (data[r][j] - means[j])
        cov[i][j] += v
        if (i !== j) cov[j][i] += v
      }
  const denom = nRows - 1
  for (let i = 0; i < nCols; i++)
    for (let j = 0; j < nCols; j++) cov[i][j] /= denom
  return cov
}

// ---- linear algebra (via ml-matrix) ----

// eigenvalues of symmetric matrix, sorted ascending
export function eigvalsh(A: number[][]): number[] {
  const m = new Matrix(A)
  const eig = new EigenvalueDecomposition(m)
  return eig.realEigenvalues.slice().sort((a, b) => a - b)
}

// solve Ax = b
export function solve(A: number[][], b: number[]): number[] {
  const mA = new Matrix(A)
  const mb = Matrix.columnVector(b)
  const x = mlSolve(mA, mb)
  return x.getColumn(0)
}

// ---- accumulation helpers ----

export function cumProd(arr: number[]): number[] {
  const out = new Array(arr.length)
  out[0] = arr[0]
  for (let i = 1; i < arr.length; i++) out[i] = out[i - 1] * arr[i]
  return out
}

export function maxAccumulate(arr: number[]): number[] {
  const out = new Array(arr.length)
  out[0] = arr[0]
  for (let i = 1; i < arr.length; i++) out[i] = Math.max(out[i - 1], arr[i])
  return out
}

// quantile of sorted array (like numpy percentile)
export function quantile(arr: number[], q: number): number {
  const sorted = [...arr].sort((a, b) => a - b)
  const idx = Math.floor(sorted.length * q)
  return sorted[Math.min(idx, sorted.length - 1)]
}
