"use strict";

function component(components, type, short = false) {
  const match = components.find(item => item.types.includes(type));
  return match ? match[short ? "short_name" : "long_name"] : "";
}

function normalizeGoogleResult(result = {}) {
  const components = Array.isArray(result.address_components) ? result.address_components : [];
  return {
    address: component(components, "route"),
    number: component(components, "street_number"),
    neighborhood: component(components, "sublocality_level_1") || component(components, "neighborhood") || component(components, "sublocality"),
    city: component(components, "administrative_area_level_2") || component(components, "locality"),
    postalCode: component(components, "postal_code")
  };
}

async function reverseGeocode({ latitude, longitude, env = process.env, fetchImpl = fetch }) {
  const provider = (env.GEOCODING_PROVIDER || "google").toLowerCase();
  if (provider !== "google") throw new Error("GEOCODING_PROVIDER_UNSUPPORTED");
  if (!env.GOOGLE_MAPS_GEOCODING_API_KEY) throw new Error("GEOCODING_NOT_CONFIGURED");
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${latitude},${longitude}`);
  url.searchParams.set("language", "pt-BR");
  url.searchParams.set("key", env.GOOGLE_MAPS_GEOCODING_API_KEY);
  const response = await fetchImpl(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("GEOCODING_PROVIDER_FAILED");
  const payload = await response.json();
  if (payload.status !== "OK" || !payload.results?.length) throw new Error("GEOCODING_NOT_FOUND");
  return normalizeGoogleResult(payload.results[0]);
}

module.exports = { normalizeGoogleResult, reverseGeocode };
