export const GET = async () => {
  const secretKey = process.env.METERED_SECRET_KEY as string;

  const res = await fetch(
    `https://lite-builder.metered.live/api/v1/turn/credential?secretKey=${secretKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expiryInSeconds: 7200 * 2, // 2 hours
      }),
    },
  );

  const { apiKey } = await res.json();

  const response = await fetch(
    `https://lite-builder.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`,
  );

  const iceServers = await response.json();

  return Response.json({ iceServers });
};
