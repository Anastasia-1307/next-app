import Link from "next/link";

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-amber-200 dark:bg-black gap-6">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Bine ai venit!
            </h1>
            <div className="flex gap-4">
                <Link href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Autentificare
                </Link>
                &nbsp;&nbsp;
                <Link href="/register" className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                     Înregistrare
                </Link>
            </div>
        </div>
    );
}