import Link from "next/link";

export default function UnauthorizedPage() {
    return (
        <div
            className="min-h-screen flex items-center justify-center
                 bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-700"
        >
            <div
                className="text-center
                   bg-white/20 backdrop-blur-lg
                   p-10 rounded-2xl
                   shadow-2xl border border-white/30"
            >
                <h1 className="text-3xl font-bold mb-3 text-white">
                    Acces interzis 🚫
                </h1>

                <p className="mb-6 text-white/90">
                    Nu ai permisiunea să accesezi această pagină.
                </p>

                <Link
                    href="/"
                    className="inline-block rounded-lg
                     bg-white/30 px-5 py-2.5
                     text-white font-medium
                     hover:bg-white/40 transition"
                >
                    Înapoi la pagina principală
                </Link>
            </div>
        </div>
    );
}