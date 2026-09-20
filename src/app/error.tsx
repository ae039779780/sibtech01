"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center px-6 text-center">
      <h1 className="display text-3xl">Something stopped the transfer</h1>
      <p className="mt-3 text-sm text-muted">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 self-center rounded-full bg-teal px-4 py-2 text-sm font-semibold text-navy"
      >
        Try again
      </button>
    </div>
  );
}
