import { Link } from "react-router-dom";
import {
  RiMicLine,
  RiArrowRightLine,
  RiGlobalLine,
  RiUserVoiceLine,
  RiSparklingLine,
  RiPlayFill,
} from "react-icons/ri";

const FEATURES = [
  {
    icon: <RiMicLine size={24} />,
    title: "Live Audio, Unscripted",
    desc: "No cameras, no lighting setups. Just drop in and share your perspective in real-time.",
  },
  {
    icon: <RiUserVoiceLine size={24} />,
    title: "Curated Communities",
    desc: "Follow minds, not just faces. Build a network around shared curiosities and late-night thoughts.",
  },
  {
    icon: <RiGlobalLine size={24} />,
    title: "Global Corridors",
    desc: "Wander through topics. From tech philosophy in Tokyo to underground music in London.",
  },
  {
    icon: <RiSparklingLine size={24} />,
    title: "Intimate by Design",
    desc: "Raise your hand to take the stage. It’s an audio-first experience that never forgets the human element.",
  },
];

const MOCK_ROOMS = [
  {
    title: "The Architecture of Tomorrow",
    host: "Elena V.",
    listeners: 342,
    topic: "Design",
    color: "bg-[#F59E0B]",
  },
  {
    title: "Vinyl Collection & Jazz Lore",
    host: "Marcus T.",
    listeners: 128,
    topic: "Music",
    color: "bg-[#1A312B]",
  },
  {
    title: "Bootstrapping in 2026",
    host: "Sarah K.",
    listeners: 512,
    topic: "Startups",
    color: "bg-[#141414]",
  },
];

const LandingPage = () => {
  return (
    <div className="landing-page min-h-screen noise-bg bg-[#F5F4EF] text-[#141414] selection:bg-[#F59E0B] selection:text-white">
      {/* Editorial Nav */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-5 md:px-12 bg-[#F5F4EF]/90 backdrop-blur-md border-b border-[#141414]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-[#141414] flex items-center justify-center bg-white text-[#141414]">
            <RiMicLine size={18} />
          </div>
          <span className="font-display italic text-3xl tracking-tight leading-none mt-1">
            gufthgu.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/auth"
            className="text-sm font-semibold hover:text-[#F59E0B] transition-colors"
          >
            Log in
          </Link>
          <Link to="/auth" className="btn-primary text-sm !px-6 !py-2.5">
            Join the conversation
          </Link>
        </div>
      </nav>

      {/* Split Hero Section */}
      <section className="pt-32 pb-20 px-6 md:px-12 min-h-[90vh] flex flex-col justify-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Typography Focus */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#141414] text-xs font-bold uppercase tracking-widest bg-white">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse" />
              Broadcasting Live
            </div>

            <h1 className="font-display text-6xl md:text-8xl leading-[0.95] tracking-tight">
              Listen to the <br />
              <span className="italic text-[#F59E0B]">world</span> talking.
            </h1>

            <p className="text-lg md:text-xl text-[#666666] max-w-lg leading-relaxed font-medium">
              Step into curated audio spaces. Hear the unfiltered thoughts of
              creators, thinkers, and friends. No aesthetics to maintain, just
              real conversations.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                to="/explore"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <RiPlayFill size={20} />
                Start Listening
              </Link>
              <Link to="/auth" className="btn-secondary w-full sm:w-auto">
                Host a Room
              </Link>
            </div>
          </div>

          {/* Right: Architectural Mock Rooms */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 border border-[#141414]/10 rounded-[32px] bg-[#EBE9E0] -z-10 rotate-3" />
            <div className="flex flex-col gap-4">
              {MOCK_ROOMS.map((room, i) => (
                <div
                  key={i}
                  className="room-card p-5 md:p-6 flex flex-col gap-4 relative overflow-hidden group cursor-pointer"
                >
                  <div
                    className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full ${room.color} opacity-10 group-hover:opacity-20 transition-opacity`}
                  />

                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-[#666666] border border-[#141414]/20 px-2 py-1 rounded-md">
                      {room.topic}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#F59E0B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                      LIVE
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-2xl md:text-3xl leading-tight mb-1">
                      {room.title}
                    </h3>
                    <p className="text-sm font-medium text-[#666666]">
                      Hosted by{" "}
                      <span className="text-[#141414] underline decoration-[#141414]/30 underline-offset-4">
                        {room.host}
                      </span>
                    </p>
                  </div>

                  <div className="mt-2 flex items-center justify-between border-t border-[#141414]/10 pt-4">
                    <div className="flex items-center gap-1.5 text-sm font-bold">
                      <RiUserVoiceLine size={16} />
                      {room.listeners} tuned in
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#141414] text-white flex items-center justify-center group-hover:bg-[#F59E0B] transition-colors">
                      <RiArrowRightLine />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Editorial Features Section */}
      <section className="py-24 px-6 md:px-12 bg-white border-y border-[#141414]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <h2 className="font-display italic text-4xl md:text-5xl leading-tight">
                Designed for dialog.
              </h2>
            </div>
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-card py-8 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-full border border-[#141414] flex items-center justify-center bg-[#F5F4EF] text-[#F59E0B]">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="text-[#666666] leading-relaxed font-medium">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Massive CTA Section */}
      <section className="py-32 px-6 md:px-12 bg-[#141414] text-[#F5F4EF] text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full opacity-10 pointer-events-none">
          <div className="w-full h-full border-[1px] border-[#F5F4EF] rounded-full scale-[2] md:scale-150" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="font-display text-5xl md:text-7xl mb-6 leading-tight">
            The stage is yours.
            <br />
            <span className="italic text-[#F59E0B]">Grab the mic.</span>
          </h2>
          <p className="text-lg text-[#999999] mb-10 max-w-xl mx-auto font-medium">
            Join thousands of daily listeners. Free forever. No invite codes
            needed.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-3 bg-[#F59E0B] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-[#141414] transition-colors"
          >
            Create your account
            <RiArrowRightLine />
          </Link>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-12 px-6 md:px-12 bg-[#F5F4EF]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display italic text-3xl">gufthgu.</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-bold text-[#666666]">
            <Link to="#" className="hover:text-[#141414] transition-colors">
              Twitter
            </Link>
            <Link to="#" className="hover:text-[#141414] transition-colors">
              Manifesto
            </Link>
            <Link to="#" className="hover:text-[#141414] transition-colors">
              Privacy
            </Link>
          </div>
          <p className="text-[#999999] text-sm font-medium">© 2026 gufthgu.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
