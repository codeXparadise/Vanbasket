export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#fff8d8] px-6 text-brand-espresso">
      <div className="text-center">
        <div className="mx-auto h-14 w-14 rounded-full border-4 border-brand-honey/25 border-t-brand-honey animate-spin" aria-label="Loading" />
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.32em] text-brand-espresso-muted">
          Preparing forest honey
        </p>
      </div>
    </div>
  );
}
