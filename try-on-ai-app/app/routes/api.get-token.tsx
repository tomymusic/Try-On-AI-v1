import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const shop = url.searchParams.get("shop");

    if (!shop) {
      return json({ error: "Falta el parámetro 'shop'" }, { status: 400 });
    }

    console.log(`📡 Buscando Access Token para la tienda: ${shop}...`);

    const store = await db.session.findFirst({  // 🔥 Cambié "prisma" por "db"
      where: { shop },
      select: { accessToken: true },
    });

    if (!store || !store.accessToken) {
      console.error(`❌ No se encontró un Access Token para la tienda: ${shop}`);
      return json({ error: "No se encontró un accessToken" }, { status: 404 });
    }

    console.log(`✅ Access Token encontrado para ${shop}.`);
    return json({ accessToken: store.accessToken });
  } catch (error) {
    console.error("❌ Error en el endpoint /api/get-token:", error);
    return json({ error: "Error interno del servidor" }, { status: 500 });
  }
}