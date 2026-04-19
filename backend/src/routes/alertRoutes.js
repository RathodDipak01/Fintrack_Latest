import express from "express";
import { z } from "zod";
import { alerts } from "../data/mockData.js";
import { created, error, ok } from "../utils/apiResponse.js";

export const alertRouter = express.Router();

alertRouter.get("/", (req, res) => ok(res, alerts));

alertRouter.post("/", (req, res) => {
  const parsed = z.object({
    title: z.string().min(3),
    type: z.string().min(2),
    severity: z.enum(["positive", "warning", "negative"]).default("warning")
  }).safeParse(req.body);

  if (!parsed.success) return error(res, 400, "Invalid alert data", parsed.error.flatten());

  const alert = {
    id: `a${alerts.length + 1}`,
    ...parsed.data,
    status: "Active"
  };
  alerts.push(alert);
  return created(res, alert, "Alert created");
});

alertRouter.patch("/:id/status", (req, res) => {
  const parsed = z.object({ status: z.enum(["Active", "Triggered", "Paused"]) }).safeParse(req.body);
  if (!parsed.success) return error(res, 400, "Invalid status", parsed.error.flatten());

  const alert = alerts.find((item) => item.id === req.params.id);
  if (!alert) return error(res, 404, "Alert not found");

  alert.status = parsed.data.status;
  return ok(res, alert, "Alert status updated");
});
