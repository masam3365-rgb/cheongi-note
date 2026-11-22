import { handleAdminLogin } from "../../server/adminHandlers.mjs";

export default async function handler(req, res) {
  await handleAdminLogin(req, res);
}
