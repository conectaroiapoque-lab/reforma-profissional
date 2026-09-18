"use strict";

const { reverseGeocode } = require("../../server/geocoding-provider");

module.exports = async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") return response.status(405).json({ error: "Método não permitido." });
  const latitude = Number(request.query?.lat);
  const longitude = Number(request.query?.lng);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return response.status(400).json({ error: "Coordenadas inválidas." });
  }
  try {
    const address = await reverseGeocode({ latitude, longitude });
    return response.status(200).json(address);
  } catch (error) {
    const unavailable = ["GEOCODING_NOT_CONFIGURED", "GEOCODING_PROVIDER_UNSUPPORTED"].includes(error.message);
    return response.status(unavailable ? 503 : 502).json({ error: "Não foi possível localizar o endereço. Digite-o manualmente." });
  }
};
