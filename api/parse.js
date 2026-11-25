// Vercel-style serverless handler: GET /api/parse?ic=YYMMDD-PB-####
import { parseMalaysianIC } from "../src/ic/index.js";

export default function handler(req, res) {
  const ic = req.query?.ic;
  if (!ic) {
    res.status(400).json({ error: 'Missing required query parameter "ic".' });
    return;
  }
  res.status(200).json(parseMalaysianIC(ic));
}
