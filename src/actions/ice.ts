"use server";

export const getIceServers = async () => {
  const apiKey = process.env.METERED_API_KEY as string;

  const response = await fetch(
    `https://lite-builder.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`,
  );

  const iceServers = await response.json();

  return iceServers;
};
