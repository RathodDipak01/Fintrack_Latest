export function ok(res, data, message = "Success") {
  return res.json({ success: true, message, data });
}

export function created(res, data, message = "Created") {
  return res.status(201).json({ success: true, message, data });
}

export function error(res, status, message, details = null) {
  return res.status(status).json({ success: false, message, details });
}
