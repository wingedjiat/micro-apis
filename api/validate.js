// Vercel-style serverless handler: GET /api/validate?ic=YYMMDD-PB-####
import { isValidMalaysianIC } from "../src/ic/index.js";

export default function handler(req, res) {
  const ic = req.query?.ic;
  if (!ic) {
    res.status(400).json({ error: 'Missing required query parameter "ic".' });
    return;
  }
  res.status(200).json({ ic, valid: isValidMalaysianIC(ic) });
}
