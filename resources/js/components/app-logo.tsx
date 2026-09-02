import { Footprints } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-[#215AA8] text-white">
                <Footprints className="size-4.5" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">P&amp;G Step Counter</span>
            </div>
        </>
    );
}
