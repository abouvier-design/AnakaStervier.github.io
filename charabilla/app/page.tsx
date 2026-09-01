import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-wide text-stone-500">
        Charabilla
      </p>
      <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
        L&apos;affiche des premiers mots de votre enfant
      </h1>
      <p className="mt-4 max-w-md text-stone-600">
        « Compote » devient « amaka ». Composez une affiche déco où chaque
        mot de votre enfant apparaît sous une illustration, à sa façon.
      </p>
      <Link
        href="/creer"
        className="mt-8 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-700"
      >
        Créer mon affiche
      </Link>
    </main>
  );
}
