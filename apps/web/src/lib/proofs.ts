import { mkdir, writeFile } from "fs/promises";
import path from "path";

/**
 * Local stub of S3-compatible proof storage.
 * Writes JSON under PROOF_STORAGE_DIR (default ./proofs).
 * Swap for S3/R2 putObject in production without changing domain shape.
 */
export async function writeProofArtifact(
  attemptId: string,
  payload: unknown,
): Promise<string> {
  const root = process.env.PROOF_STORAGE_DIR || "./proofs";
  const absRoot = path.isAbsolute(root)
    ? root
    : path.join(process.cwd(), root);
  await mkdir(absRoot, { recursive: true });
  const fileName = `proof_${attemptId}.json`;
  const absPath = path.join(absRoot, fileName);
  await writeFile(absPath, JSON.stringify(payload, null, 2), "utf8");
  return `local://${fileName}`;
}
