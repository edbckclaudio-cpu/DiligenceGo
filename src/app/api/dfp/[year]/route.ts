import { NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { year: string } }) {
  const y = Number(params.year);
  if (!y || y < 2000 || y > 9999) {
    return new Response("invalid year", { status: 400 });
  }
  const url = `https://dados.cvm.gov.br/dados/CIA_ABERTA/DOC/DFP/DADOS/dfp_cia_aberta_${y}.zip`;
  const resp = await fetch(url, { redirect: "follow" });
  if (!resp.ok) {
    return new Response("unavailable", { status: 502 });
  }
  const buf = await resp.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "content-type": "application/zip",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*"
    }
  });
}
