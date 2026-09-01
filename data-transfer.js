import { getCollection, setDocument } from "./firestore.js";

const TRANSFER_COLLECTIONS = ["students", "fees", "settings"];
const FILE_PREFIX = "dingel-hafizia-backup";

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export async function exportData() {
  const backup = {
    app: "Dingel Hafizia Madrasa",
    format: "dingel-hafizia-json-v1",
    exportedAt: new Date().toISOString(),
    collections: {}
  };

  for (const name of TRANSFER_COLLECTIONS) {
    backup.collections[name] = await getCollection(name);
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${FILE_PREFIX}-${stamp()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return backup;
}

function validateBackup(data) {
  if (!data || typeof data !== "object") throw new Error("Invalid backup file.");
  if (data.format !== "dingel-hafizia-json-v1") throw new Error("This is not a Dingel Hafizia backup file.");
  if (!data.collections || typeof data.collections !== "object") throw new Error("Backup collections are missing.");
  for (const name of TRANSFER_COLLECTIONS) {
    if (data.collections[name] !== undefined && !Array.isArray(data.collections[name])) {
      throw new Error(`Invalid ${name} data in backup.`);
    }
  }
}

export async function importData(file) {
  const text = await file.text();
  const data = JSON.parse(text);
  validateBackup(data);

  let count = 0;
  for (const name of TRANSFER_COLLECTIONS) {
    const rows = data.collections[name] || [];
    for (const row of rows) {
      if (!row || typeof row !== "object" || !row.id) continue;
      const { id, ...fields } = row;
      await setDocument(name, id, fields);
      count += 1;
    }
  }

  return { count, exportedAt: data.exportedAt || null };
}

export { TRANSFER_COLLECTIONS };