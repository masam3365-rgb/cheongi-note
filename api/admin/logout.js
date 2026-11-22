import { handleAdminLogout } from "../../server/adminHandlers.mjs";

export default async function handler(req, res) {
  await handleAdminLogout(req, res);
}
