import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const WHATSAPP_NUMBER = "254792180744";

type Merch = Tables<"merchandise">;

function ProductCard({ product }: { product: Merch }) {
  const order = () => {
    const message = `Hi MESA KU! I'd like to order a ${product.name}. Please let me know the next steps.`;
    const url = product.order_url || `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
        {product.image_url ? (
          <img src={product.image_url} alt={`${product.name} - MESA KU official merchandise`} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
      </div>
      <h3 className="font-semibold text-lg text-gray-900">{product.name}</h3>
      {product.price != null && (
        <p className="text-[#1E3A8A] font-bold text-base mt-1">KSh {product.price.toLocaleString()}</p>
      )}
      {product.description && (
        <p className="text-base text-gray-500 mt-1">{product.description}</p>
      )}
      {product.stock_status === "out_of_stock" ? (
        <p className="text-sm text-destructive font-medium mt-3">Out of stock</p>
      ) : (
        <button
          onClick={order}
          className="w-full h-12 bg-green-600 text-white rounded-lg mt-4 font-semibold text-base hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.612.616l4.528-1.472A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.234 0-4.308-.726-5.986-1.956l-.418-.312-2.686.873.893-2.632-.342-.432A9.956 9.956 0 012 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
          {product.stock_status === "pre_order" ? "Pre-order via WhatsApp" : "Order via WhatsApp"}
        </button>
      )}
    </div>
  );
}

const MerchandiseSection = () => {
  const [products, setProducts] = useState<Merch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("merchandise")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .then(({ data }) => {
        setProducts(data || []);
        setLoading(false);
      });
  }, []);

  return (
    <section id="merchandise" className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Merch</h2>
          <p className="text-base text-gray-500 mt-2">Rep the association. Built for engineers.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">No merchandise available right now. Check back soon!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MerchandiseSection;
