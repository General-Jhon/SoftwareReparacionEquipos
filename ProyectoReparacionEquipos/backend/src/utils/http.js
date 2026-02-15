export const badRequest = (res, message) => res.status(400).json({ error: message });
