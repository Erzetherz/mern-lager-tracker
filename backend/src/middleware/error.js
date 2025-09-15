export function notFound(req, res, next) {
  res.status(404).json({ error: "Endpoint nicht gefunden" });
}

export function errorHandler(err, req, res, next) {
  console.error(err);
  const status = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || "Unbekannter Fehler";
  if (err.name === "ValidationError") {
    res.status(400);
    message = Object.values(err.errors).map((e) => e.message).join("; ");
  }
  res.status(status).json({ error: message });
}
