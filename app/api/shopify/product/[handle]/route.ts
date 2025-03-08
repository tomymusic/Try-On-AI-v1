import { NextRequest, NextResponse } from "next/server";

const SHOPIFY_STORE = process.env.SHOPIFY_STORE!;
const SHOPIFY_API_KEY = process.env.SHOPIFY_API_KEY!;

const CATEGORY_MAP: Record<string, string[]> = {
    "upper_body": ["camisa", "polera", "chaqueta", "top", "suéter", "sweater", "t-shirt", "shirt", "jacket",
        "jersey", "hoodie", "parka", "camiseta", "anorak", "cazadora", "pullover", "chaquetón",
        "abrigo", "blazer", "poleron"],
    "lower_body": ["pantalón", "jeans", "shorts", "falda", "jogger", "cargo", "leggings", "pants", "skirt",
        "bermuda", "bóxer", "calza", "culotte", "chandal", "trousers"],
    "dresses": ["vestido", "enterizo", "jumpsuit", "overall", "dress", "mono", "pichi", "maxi vestido"]
};

export async function GET(req: NextRequest) {
    try {
        const urlParts = req.nextUrl.pathname.split("/");
        const handle = urlParts[urlParts.length - 1];

        console.log(`📢 [Shopify API] Buscando producto: ${handle}`);

        const response = await fetch(
            `https://${SHOPIFY_STORE}/admin/api/2025-01/products.json?handle=${handle}`,
            {
                headers: {
                    "X-Shopify-Access-Token": SHOPIFY_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`📡 [Shopify API] Código de respuesta: ${response.status}`);

        if (!response.ok) {
            console.error(`❌ [Shopify API] Error: ${response.statusText}`);
            return NextResponse.json(
                { error: `No se pudo obtener el producto ${handle}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        if (!data.products || data.products.length === 0) {
            console.warn(`⚠️ [Shopify API] Producto no encontrado: ${handle}`);
            return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
        }

        const product = data.products[0];

        const category = Object.entries(CATEGORY_MAP).find(([, keywords]) =>
            keywords.some(keyword => (product.title + " " + product.product_type).toLowerCase().includes(keyword))
        )?.[0] || null;

        const productInfo = {
            id: product.id,
            title: product.title,
            handle: product.handle,
            product_type: product.product_type,
            category: category,
            images: product.images.map((img: { src: string }) => img.src),
        };

        console.log(`✅ [Shopify API] Producto encontrado: ${product.title} (${category})`);

        return NextResponse.json(productInfo);
    } catch (error) {
        console.error("❌ [Shopify API] Error inesperado:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Unknown error" },
            { status: 500 }
        );
    }
}
