'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h2 className="mb-2 text-xl font-bold">Đã xảy ra lỗi</h2>
      <p className="mb-4 text-muted-foreground">{error.message}</p>
      <button onClick={reset} className="underline">Thử lại</button>
    </div>
  );
}
