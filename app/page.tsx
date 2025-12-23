import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Wifi, Coffee, Lock, Users, Mountain, ArrowRight, Instagram, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
            Pathfinders Nest
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/login"
              className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors text-sm uppercase tracking-wider"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 bg-white text-indigo-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-mountain.png"
            alt="View of Mount Kanchenjunga"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          {/* Gradients for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-slate-900/90" />
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center text-white">
          <div className="animate-fade-in-up space-y-8 max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-sm font-medium tracking-wide uppercase mb-4">
              Welcome to Darjeeling
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight drop-shadow-lg">
              Wake Up to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400">
                Kanchenjunga
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed font-light">
              Experience the tranquility of the Himalayas from your balcony.
              The perfect base camp for your mountain adventure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <a
                href="https://www.booking.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold text-lg transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] flex items-center justify-center gap-2"
              >
                Check Availability
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="#amenities"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full font-semibold text-lg transition-all duration-300 flex items-center justify-center"
              >
                Explore Amenities
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/70">
          <div className="w-1 h-12 rounded-full border-2 border-white/30 flex justify-center p-1">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-100 rounded-full blur-3xl opacity-30" />
                <h2 className="text-4xl font-bold text-slate-900 mb-6 relative">
                  In the Heart of <br /> the Hills
                </h2>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  We are perfectly situated to give you both peace and accessibility.
                  Just steps away from the bustling Mall Road yet tucked away enough
                  to offer serene mountain views.
                </p>

                <div className="space-y-6">
                  {[
                    { title: 'Mall Road', dist: '10 min walk', icon: Users },
                    { title: 'HMI & Zoo', dist: '15 min walk', icon: MapPin },
                    { title: 'Tiger Hill', dist: '11 km drive', icon: Mountain },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 transition-colors">
                      <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900">{item.title}</h4>
                        <p className="text-slate-500 text-sm">{item.dist}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-2xl rotate-3 opacity-10 group-hover:rotate-6 transition-transform duration-500" />
                <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3] shadow-2xl">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3553.7581910145027!2d88.2635036751187!3d27.037805876572865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e42f005eef674b%3A0x50375978c6cf7a1!2sPathfinder%E2%80%99s%20Nest%20Hostel!5e0!3m2!1sen!2sin!4v1766521216360!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Glassmorphism */}
      <section id="amenities" className="py-24 bg-slate-50 relative">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-semibold text-indigo-600 tracking-wider uppercase mb-3">Amenities</h2>
            <h3 className="text-4xl font-bold text-slate-900 mb-4">Curated for Your Comfort</h3>
            <p className="text-slate-600 text-lg">
              From high-speed WiFi for digital nomads to cozy corners for book lovers,
              we have everything you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Mountain, title: "Mountain View Rooms", desc: "Wake up to the golden peaks of Kanchenjunga." },
              { icon: Wifi, title: "High-Speed WiFi", desc: "Stay connected with premium fiber internet." },
              { icon: Coffee, title: "Home-Style Cafe", desc: "Freshly brewed Darjeeling tea and local delicacies." },
              { icon: Users, title: "Cozy Common Area", desc: "Meet travelers from around the world." },
              { icon: Lock, title: "Secure Lockers", desc: "24/7 security for your valuables." },
              { icon: Star, title: "Premium Bedding", desc: "Orthopedic mattresses and warm duvets." },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Social Proof */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-12">Travelers Love Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Joel J Pereira",
                role: "Local Guide · 17 Day Stay",
                text: "One of the Best Stays of My Life! I came to Darjeeling thinking I’d stay just 2 days but ended up spending 17. The Kanchenjunga view right from the hostel was a dream. Waking up to that every morning was unforgettable."
              },
              {
                name: "Taha Basrai",
                role: "Local Guide · Solo Traveler",
                text: "Beautiful hostel, with capsule beds for your comfort. Quaint atmosphere with views of Kanchenjunga. I'd honestly recommend this for the solo traveller who wants to get into backpacking mode."
              },
              {
                name: "Chinmoy Thakuria",
                role: "Traveler",
                text: "I had a wonderful staying experience in this hostel. I genuinely liked the service, rooms, cleanliness, the vibes everything. If you are in doubt whether it will be good, I just want to say you can go for it you wont regret."
              }
            ].map((review, i) => (
              <div key={i} className="bg-slate-50 p-8 rounded-2xl relative hover:shadow-md transition-shadow text-left">
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-700 italic mb-6 leading-relaxed">&quot;{review.text}&quot;</p>
                <div>
                  <div className="font-bold text-slate-900">{review.name}</div>
                  <div className="text-slate-500 text-sm">{review.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Your Mountain Home Awaits
          </h2>
          <p className="text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Book directly with us for the best rates and a guaranteed mountain view room.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.booking.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Book Now
            </a>
            <a
              href="https://www.instagram.com/pathfindersnesthostel"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <Instagram className="w-5 h-5" />
              Follow on Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold text-white tracking-tight">Pathfinders Nest</span>
              <p className="text-sm mt-2">Darjeeling, West Bengal</p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="#" className="hover:text-white transition-colors">About</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact</Link>
              <Link href="/login" className="hover:text-white transition-colors">Staff Login</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-xs">
            © {new Date().getFullYear()} Pathfinders Nest. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
