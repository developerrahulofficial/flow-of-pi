import { ArrowRight, Share, Download, RefreshCw } from "lucide-react";

export function ShortcutGuide() {
  return (
    <section id="shortcut-guide" className="py-24 border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-mono font-bold text-white mb-4">Daily Automation</h2>
          <p className="text-muted-foreground">
            Wake up to a new digit of Pi every morning using iOS Shortcuts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Download className="w-6 h-6" />,
              title: "1. Create Shortcut",
              desc: "Open the Shortcuts app on your iPhone and create a new automation."
            },
            {
              icon: <RefreshCw className="w-6 h-6" />,
              title: "2. Fetch Image",
              desc: "Add action 'Get Contents of URL' pointing to our latest wallpaper API endpoint."
            },
            {
              icon: <Share className="w-6 h-6" />,
              title: "3. Set Wallpaper",
              desc: "Add action 'Set Wallpaper' using the image from the previous step."
            }
          ].map((step, i) => (
            <div key={i} className="bg-neutral-900/50 border border-white/5 p-6 rounded-sm hover:bg-neutral-900 transition-colors">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-white mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-mono text-white mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-block bg-neutral-900 border border-white/10 rounded px-4 py-2">
            <code className="text-xs md:text-sm text-accent font-mono select-all">
              {window.location.origin}/api/pi/wallpaper?latest=true
            </code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Copy this URL for your shortcut</p>
        </div>
      </div>
    </section>
  );
}
