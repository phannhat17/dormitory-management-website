"use client";

import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";
import { useRouter } from 'next/navigation';


export function RefreshButton() {
    const router = useRouter();


    return (
        <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-sm"
            onClick={router.refresh}
        >
            <RotateCw className="h-3.5 w-3.5" />
        </Button>
    );
}