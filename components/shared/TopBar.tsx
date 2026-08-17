import Image from "next/image";

export default function TopBar({ title }: { title?: string }) {
  return (
    <header className="safe-top sticky top-0 z-20 flex items-center gap-2.5 bg-base-900/90 px-5 pb-3 pt-4 backdrop-blur-xl">
      <div className="relative h-7 w-7 shrink-0">
        <Image src="/icons/icon-192.png" alt="ArchBeat" fill className="rounded-md" />
      </div>
      <h1 className="text-[19px] font-bold tracking-tight text-base-50">
        {title ?? "ArchBeat"}
      </h1>
    </header>
  );
}
