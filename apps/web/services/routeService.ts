export type RouteSummary = {
  distanceKm: number;
  durationMinutes: number;
};

export async function getDeliveryRoute({
  riderLatitude,
  riderLongitude,
  customerLatitude,
  customerLongitude,
}: {
  riderLatitude: number;
  riderLongitude: number;
  customerLatitude: number;
  customerLongitude: number;
}): Promise<RouteSummary | null> {
  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;

  if (!apiKey) return null;

  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [riderLongitude, riderLatitude],
          [customerLongitude, customerLatitude],
        ],
      }),
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route?.summary) return null;

  return {
    distanceKm: Number((route.summary.distance / 1000).toFixed(1)),
    durationMinutes: Math.max(1, Math.round(route.summary.duration / 60)),
  };
}