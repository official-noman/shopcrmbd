import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">ShopCRM BD</h1>
      <p className="text-sm text-slate-600">
        Welcome. Please login to continue.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}

