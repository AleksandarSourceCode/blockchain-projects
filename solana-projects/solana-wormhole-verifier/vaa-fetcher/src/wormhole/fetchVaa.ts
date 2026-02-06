export async function fetchVaa(
  baseUrl: string,
  chainId: number,
  emitterAddress: string,
  sequence: number | string,
): Promise<unknown> {
  const url = `${baseUrl}/vaas/${chainId}/${emitterAddress}/${sequence}`;

  const res = await fetch(url, {
    headers: {
      accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} – ${res.statusText}`);
  }

  return await res.json();
}
