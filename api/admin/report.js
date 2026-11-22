import { handleAdminReport } from "../../server/adminHandlers.mjs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "1mb",
    },
    responseLimit: false,
  },
  maxDuration: 60,
};

export default async function handler(req, res) {
  await handleAdminReport(req, res);
}
