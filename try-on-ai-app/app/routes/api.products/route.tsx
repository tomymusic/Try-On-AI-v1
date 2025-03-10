import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import db from "../../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("🔍 Iniciando loader para obtener el producto...");

  try {
    const url = new URL(request.url);
    const handle = url.searchParams.get("handle")?.trim() || undefined;

    if (!handle) {
      console.error("🚨 Error: Falta el identificador del producto.");
      return json({ error: "Falta el identificador del producto." }, { status: 400 });
    }

    // ✅ Obtener el Access Token de los headers
    const accessToken = request.headers.get("X-Shopify-Access-Token");

    if (!accessToken) {
      console.error("❌ Falta el Access Token en la petición.");
      return json({ error: "Falta el Access Token." }, { status: 401 });
    }

    console.log("🔍 Verificando Access Token en la base de datos...");
    const store = await db.session.findFirst({ where: { accessToken }, select: { shop: true } });

    if (!store) {
      console.error("❌ Access Token inválido o no encontrado.");
      return json({ error: "Access Token inválido." }, { status: 403 });
    }

    console.log(`✅ Access Token válido para la tienda: ${store.shop}`);

    // ✅ Obtener los datos del producto desde Shopify
    return await fetchProductData(store.shop, accessToken, handle);

  } catch (error) {
    console.error("❌ Error en el endpoint de productos:", error);
    return json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// ✅ Función para obtener datos del producto desde Shopify
async function fetchProductData(shop: string, accessToken: string, handle: string) {
  const query = `#graphql
    query {
      productByHandle(handle: "${handle}") {
        title
        productType
        featuredImage { url }
      }
    }`;

  console.log("📄 Enviando consulta GraphQL:", query);

  // ✅ Hacer la petición GraphQL a Shopify
  const response = await fetch(`https://${shop}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Error en la consulta GraphQL: ${response.statusText}`);
  }

  return new Response(await response.text(), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}