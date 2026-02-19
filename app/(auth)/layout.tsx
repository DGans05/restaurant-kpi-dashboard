export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left cream panel */}
      <div className="relative flex w-full flex-col justify-center overflow-hidden bg-[#FFF6E9] px-16 py-12 md:w-[45%] md:rounded-r-[40px]">
        {children}
      </div>
      {/* Right dark side — exposes the body gradient */}
      <div className="hidden flex-1 md:block" />
    </div>
  );
}
