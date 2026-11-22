import { handleAdminSession } from "../../server/adminHandlers.mjs";

export default async function handler(req, res) {
  await handleAdminSession(req, res);
}
