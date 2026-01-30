import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LogIn, Instagram } from "lucide-react";

interface JoinDialogProps {
    trigger?: React.ReactNode;
}

export function JoinDialog({ trigger }: JoinDialogProps) {
    const { login } = useAuth();
    const [handle, setHandle] = useState("");

    const defaultTrigger = (
        <Button
            size="sm"
            variant="outline"
            className="border-white/20 hover:bg-white hover:text-black hover:border-white transition-all duration-300 font-mono text-xs uppercase tracking-widest"
        >
            <LogIn className="w-3 h-3 mr-2" />
            Join
        </Button>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="bg-black border-white/20 text-white font-mono max-w-sm">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="text-xl tracking-widest text-center uppercase text-accent">Join the Flow</DialogTitle>
                    <DialogDescription className="text-white/40 text-center text-[10px] leading-relaxed">
                        CLAIM YOUR UNIQUE DIGIT OF PI. <br />
                        YOUR HANDLE WILL BE TIED TO THE SEQUENCE.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <div className="relative">
                            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <Input
                                placeholder="INSTAGRAM HANDLE"
                                value={handle}
                                onChange={(e) => setHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
                                className="bg-white/5 border-white/10 pl-10 h-12 text-sm tracking-widest focus-visible:ring-accent"
                            />
                        </div>
                        <p className="text-[9px] text-white/20 uppercase tracking-tighter pl-1 text-center">
                            Used as your display name in the gallery
                        </p>
                    </div>

                    <Button
                        className="w-full h-12 bg-white text-black hover:bg-accent hover:text-white text-xs tracking-[0.2em] font-bold uppercase transition-all"
                        onClick={() => login(handle)}
                        disabled={!handle}
                    >
                        Continue with Google
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
