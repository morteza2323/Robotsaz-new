import { database } from "@/lib/db";
import { CustomPartRequest } from "@/lib/types";

type RequestRow = {
  id: string;
  order_number: number;
  name: string;
  email: string;
  phone: string;
  description: string;
  quantity: string | null;
  material: string | null;
  files: CustomPartRequest["files"];
  status: CustomPartRequest["status"];
  created_at: Date | string;
};

const columns = "id, order_number, name, email, phone, description, quantity, material, files, status, created_at";

function mapRequest(row: RequestRow): CustomPartRequest {
  return {
    id: row.id,
    orderNumber: row.order_number,
    name: row.name,
    email: row.email,
    phone: row.phone,
    description: row.description,
    quantity: row.quantity || undefined,
    material: row.material || undefined,
    files: row.files,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getCustomPartRequests() {
  const result = await database.query<RequestRow>(`SELECT ${columns} FROM custom_part_requests ORDER BY created_at DESC`);
  return result.rows.map(mapRequest);
}

export async function addCustomPartRequest(request: Omit<CustomPartRequest, "orderNumber">) {
  const values = [request.id, request.name, request.email, request.phone, request.description, request.quantity || null, request.material || null, JSON.stringify(request.files), request.status, request.createdAt];
  const result = await database.query<RequestRow>(`INSERT INTO custom_part_requests (id, name, email, phone, description, quantity, material, files, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10) RETURNING ${columns}`, values);
  return mapRequest(result.rows[0]);
}

export async function setCustomPartRequestFiles(id: string, files: CustomPartRequest["files"]) {
  const result = await database.query<RequestRow>(`UPDATE custom_part_requests SET files = $1::jsonb WHERE id = $2 RETURNING ${columns}`, [JSON.stringify(files), id]);
  if (!result.rows[0]) return null;
  return mapRequest(result.rows[0]);
}

export async function getCustomPartRequest(id: string) {
  return (await getCustomPartRequests()).find((request) => request.id === id);
}

export async function deleteCustomPartRequest(id: string) {
  const result = await database.query("DELETE FROM custom_part_requests WHERE id = $1", [id]);
  return Boolean(result.rowCount);
}
