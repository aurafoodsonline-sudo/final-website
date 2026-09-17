import { db } from "@/db";
import { products } from "@/db/schema";
import NewOrderForm from "./NewOrderForm";

export default async function NewOrderPage() {
  const all = await db.select().from(products);
  return (
    <div>
      <h1 className="font-heritage text-2xl mb-4">Manual Order Entry</h1>
      <NewOrderForm products={all.map((p) => ({ id: p.id, nameEn: p.nameEn, price: p.price }))} />
    </div>
  );
}
