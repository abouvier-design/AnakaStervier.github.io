import SuiviCommande from "@/components/SuiviCommande";

export const metadata = { title: "charabilla — suivi de commande" };

export default async function PageCommande({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SuiviCommande id={id} />;
}
