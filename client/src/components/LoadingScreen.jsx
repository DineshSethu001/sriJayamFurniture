
import BrandLogo from "./BrandLogo";

export default function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4EE]">
      <div className="text-center">
        <BrandLogo className="mx-auto mb-5 h-16 w-16" />

        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#D8C4A5] border-t-[#62452F]" />

        <p className="mt-4 text-sm text-[#827568]">
          Preparing your workspace...
        </p>
      </div>
    </main>
  );
}
