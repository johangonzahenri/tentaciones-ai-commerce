import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_3D_DIR = path.resolve(__dirname, "../public/assets/3d");

function ensureDirectory(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Encodes geometry into a valid binary GLB file according to the glTF 2.0 Binary specification:
 * Header (12 bytes: Magic 0x46546C67, Version 2, Total Length)
 * Chunk 0: JSON Chunk (Type 0x4E4F534A, length, payload padded with 0x20 spaces)
 * Chunk 1: BIN Chunk (Type 0x004E4942, length, payload padded with 0x00)
 */
function createBinaryGLB(name, vertices, indices, color = [0.49, 0.44, 0.94, 1.0]) {
  // 1. Pack binary buffer (Vertices: Float32Array 3 components; Indices: Uint16Array 3 components)
  const posCount = vertices.length / 3;
  const indCount = indices.length;

  const posBuffer = Buffer.from(new Float32Array(vertices).buffer);
  const indBuffer = Buffer.from(new Uint16Array(indices).buffer);

  // Align byte offsets to 4-byte boundaries
  const indPaddedLength = Math.ceil(indBuffer.length / 4) * 4;
  const indPadding = Buffer.alloc(indPaddedLength - indBuffer.length, 0);

  const binBuffer = Buffer.concat([indBuffer, indPadding, posBuffer]);
  const binLength = binBuffer.length;
  const binPaddedLength = Math.ceil(binLength / 4) * 4;
  const binChunkPadding = Buffer.alloc(binPaddedLength - binLength, 0x00);

  // Calculate min/max for bounding box
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < vertices.length; i += 3) {
    minX = Math.min(minX, vertices[i]);
    minY = Math.min(minY, vertices[i + 1]);
    minZ = Math.min(minZ, vertices[i + 2]);
    maxX = Math.max(maxX, vertices[i]);
    maxY = Math.max(maxY, vertices[i + 1]);
    maxZ = Math.max(maxZ, vertices[i + 2]);
  }

  // 2. Build glTF 2.0 JSON structure
  const gltf = {
    asset: {
      version: "2.0",
      generator: "Tentaciones AI Operating Platform GLB Pipeline v1.2",
      copyright: "CC0-1.0 / Synthetic Project Asset",
    },
    scene: 0,
    scenes: [{ name: `${name}-Scene`, nodes: [0] }],
    nodes: [{ name: name, mesh: 0 }],
    meshes: [
      {
        name: `${name}-Mesh`,
        primitives: [
          {
            attributes: { POSITION: 1 },
            indices: 0,
            material: 0,
            mode: 4, // TRIANGLES
          },
        ],
      },
    ],
    materials: [
      {
        name: `${name}-Material`,
        pbrMetallicRoughness: {
          baseColorFactor: color,
          metallicFactor: 0.1,
          roughnessFactor: 0.6,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5123, // UNSIGNED_SHORT
        count: indCount,
        type: "SCALAR",
        max: [Math.max(...indices)],
        min: [Math.min(...indices)],
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126, // FLOAT
        count: posCount,
        type: "VEC3",
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ],
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: indBuffer.length,
        target: 34963, // ELEMENT_ARRAY_BUFFER
      },
      {
        buffer: 0,
        byteOffset: indPaddedLength,
        byteLength: posBuffer.length,
        target: 34962, // ARRAY_BUFFER
      },
    ],
    buffers: [
      {
        byteLength: binPaddedLength,
      },
    ],
  };

  const jsonString = JSON.stringify(gltf);
  const jsonBuffer = Buffer.from(jsonString, "utf8");
  const jsonPaddedLength = Math.ceil(jsonBuffer.length / 4) * 4;
  const jsonPadding = Buffer.alloc(jsonPaddedLength - jsonBuffer.length, 0x20); // Pad with spaces

  // 3. Assemble binary chunks
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonPaddedLength, 0);
  jsonChunkHeader.writeUInt32LE(0x4e4f534a, 4); // JSON

  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(binPaddedLength, 0);
  binChunkHeader.writeUInt32LE(0x004e4942, 4); // BIN

  const totalLength = 12 + 8 + jsonPaddedLength + 8 + binPaddedLength;

  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546c67, 0); // "glTF"
  header.writeUInt32LE(2, 4); // Version 2
  header.writeUInt32LE(totalLength, 8); // Total File Length

  return Buffer.concat([
    header,
    jsonChunkHeader,
    jsonBuffer,
    jsonPadding,
    binChunkHeader,
    binBuffer,
    binChunkPadding,
  ]);
}

/**
 * Creates standard text-based GLTF 2.0 with embedded data URI buffer
 */
function createEmbeddedGLTF(name, vertices, indices, color = [0.38, 0.44, 0.94, 1.0]) {
  const posBuffer = Buffer.from(new Float32Array(vertices).buffer);
  const indBuffer = Buffer.from(new Uint16Array(indices).buffer);
  const indPaddedLength = Math.ceil(indBuffer.length / 4) * 4;
  const indPadding = Buffer.alloc(indPaddedLength - indBuffer.length, 0);
  const combinedBuffer = Buffer.concat([indBuffer, indPadding, posBuffer]);

  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < vertices.length; i += 3) {
    minX = Math.min(minX, vertices[i]);
    minY = Math.min(minY, vertices[i + 1]);
    minZ = Math.min(minZ, vertices[i + 2]);
    maxX = Math.max(maxX, vertices[i]);
    maxY = Math.max(maxY, vertices[i + 1]);
    maxZ = Math.max(maxZ, vertices[i + 2]);
  }

  const base64Data = combinedBuffer.toString("base64");

  const gltf = {
    asset: {
      version: "2.0",
      generator: "Tentaciones AI Operating Platform GLTF Pipeline v1.2",
      copyright: "CC0-1.0 / Synthetic Project Asset",
    },
    scene: 0,
    scenes: [{ name: `${name}-Scene`, nodes: [0] }],
    nodes: [{ name: name, mesh: 0 }],
    meshes: [
      {
        name: `${name}-Mesh`,
        primitives: [
          {
            attributes: { POSITION: 1 },
            indices: 0,
            material: 0,
            mode: 4,
          },
        ],
      },
    ],
    materials: [
      {
        name: `${name}-Material`,
        pbrMetallicRoughness: {
          baseColorFactor: color,
          metallicFactor: 0.1,
          roughnessFactor: 0.5,
        },
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5123,
        count: indices.length,
        type: "SCALAR",
        max: [Math.max(...indices)],
        min: [Math.min(...indices)],
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126,
        count: vertices.length / 3,
        type: "VEC3",
        max: [maxX, maxY, maxZ],
        min: [minX, minY, minZ],
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: indBuffer.length,
        target: 34963,
      },
      {
        buffer: 0,
        byteOffset: indPaddedLength,
        byteLength: posBuffer.length,
        target: 34962,
      },
    ],
    buffers: [
      {
        byteLength: combinedBuffer.length,
        uri: `data:application/octet-stream;base64,${base64Data}`,
      },
    ],
  };

  return JSON.stringify(gltf, null, 2);
}

// Geometry Definitions
const sneakerVertices = [
  -50, 40, -20,   50, 40, -20,   60, 20, 0,    40, -20, 0,
  -40, -30, 0,   -60, 0, 0,     -50, 40, 20,   50, 40, 20,
   60, 20, 20,    40, -20, 20,
];
const sneakerIndices = [
  0, 1, 2,  0, 2, 5,  5, 2, 3,  5, 3, 4,
  6, 7, 8,  6, 8, 5,  5, 8, 9,  0, 6, 7,
  0, 7, 1,  1, 7, 8,  1, 8, 2,  2, 8, 9,
];

const dressVertices = [
  -20, -60, -10,   20, -60, -10,   20, -60, 10,  -20, -60, 10,
  -15, -10, -15,   15, -10, -15,   15, -10, 15,  -15, -10, 15,
  -55,  60, -30,   55,  60, -30,   55,  60, 30,  -55,  60, 30,
];
const dressIndices = [
  0, 1, 5,  0, 5, 4,  1, 2, 6,  1, 6, 5,
  2, 3, 7,  2, 7, 6,  3, 0, 4,  3, 4, 7,
  4, 5, 9,  4, 9, 8,  5, 6, 10, 5, 10, 9,
  6, 7, 11, 6, 11, 10, 7, 4, 8, 7, 8, 11,
];

const poleraVertices = [
  -30, -50, -15,   30, -50, -15,   30, -50, 15,  -30, -50, 15,
  -55, -20, -15,   55, -20, -15,   55, -20, 15,  -55, -20, 15,
  -35,  50, -20,   35,  50, -20,   35,  50, 20,  -35,  50, 20,
];
const poleraIndices = [
  0, 1, 5,  0, 5, 4,  1, 2, 6,  1, 6, 5,
  2, 3, 7,  2, 7, 6,  3, 0, 4,  3, 4, 7,
  4, 5, 9,  4, 9, 8,  5, 6, 10, 5, 10, 9,
  6, 7, 11, 6, 11, 10, 7, 4, 8, 7, 8, 11,
];

const relojVertices = [
  -25, -25, -15,   25, -25, -15,   35, 0, -15,   25, 25, -15,
  -25, 25, -15,   -35, 0, -15,    -25, -25, 15,  25, -25, 15,
   35, 0, 15,      25, 25, 15,    -25, 25, 15,  -35, 0, 15,
   0, 0, -20,      0, 0, 20,
];
const relojIndices = [
  0, 1, 2,  0, 2, 5,  5, 2, 3,  5, 3, 4,
  6, 7, 8,  6, 8, 11, 11, 8, 9, 11, 9, 10,
  0, 6, 7,  0, 7, 1,  1, 7, 8,  1, 8, 2,
  2, 8, 9,  2, 9, 3,  3, 9, 10, 3, 10, 4,
  4, 10, 11, 4, 11, 5, 5, 11, 6, 5, 6, 0,
];

// Generate and write assets
ensureDirectory(path.join(PUBLIC_3D_DIR, "footwear"));
ensureDirectory(path.join(PUBLIC_3D_DIR, "apparel"));
ensureDirectory(path.join(PUBLIC_3D_DIR, "accessories"));

// 1. GLB Footwear
const sneakerGLB = createBinaryGLB("ProCarbonRacer", sneakerVertices, sneakerIndices, [0.12, 0.12, 0.15, 1.0]);
fs.writeFileSync(path.join(PUBLIC_3D_DIR, "footwear/pro-carbon-racer.glb"), sneakerGLB);
console.log(`[OK] Generated pro-carbon-racer.glb (${sneakerGLB.length} bytes)`);

// 2. GLTF Apparel: Polera Essential
const poleraGLTF = createEmbeddedGLTF("PoleraEssential", poleraVertices, poleraIndices, [0.95, 0.95, 0.95, 1.0]);
fs.writeFileSync(path.join(PUBLIC_3D_DIR, "apparel/polera-essential.gltf"), poleraGLTF);
console.log(`[OK] Generated polera-essential.gltf (${poleraGLTF.length} bytes)`);

// 3. GLTF Apparel: Silk Evening Dress
const dressGLTF = createEmbeddedGLTF("SilkEveningDress", dressVertices, dressIndices, [0.15, 0.10, 0.25, 1.0]);
fs.writeFileSync(path.join(PUBLIC_3D_DIR, "apparel/silk-evening-dress.gltf"), dressGLTF);
console.log(`[OK] Generated silk-evening-dress.gltf (${dressGLTF.length} bytes)`);

// 4. GLB Accessories: Reloj Titanio
const relojGLB = createBinaryGLB("RelojTitanio", relojVertices, relojIndices, [0.75, 0.78, 0.82, 1.0]);
fs.writeFileSync(path.join(PUBLIC_3D_DIR, "accessories/reloj-titanio.glb"), relojGLB);
console.log(`[OK] Generated reloj-titanio.glb (${relojGLB.length} bytes)`);

console.log("[SUCCESS] All 4 synthetic 3D GLB/GLTF assets generated in public/assets/3d/");
