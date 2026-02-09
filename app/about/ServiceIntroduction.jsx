'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

import { Nunito } from 'next/font/google'; // Change to another font if you prefer
import Link from 'next/link';
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'], // Add weights you need
  display: 'swap',
});

export default function ServiceIntroduction() {
  return (
    <div className="min-h-screen text-primary-50 overflow-hidden">
      {/* Hero with subtle image background */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="relative py-32 px-8 text-center"
      >
        <div className="absolute inset-0 opacity-40">
          <Image
            src="https://wallpapers.com/images/hd/colorful-abstract-clouds-desktop-axob5r3sbaullmrk.jpg" // Soft pastel clouds, white-dominant
            alt="Soft pastel background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative max-w-4xl mx-auto">
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, delay: 0.2 }}
          >
            <Image
              src="/pokemon_logo.png"
              alt="Pokémon Logo"
              width={600}
              height={200}
              className="mx-auto mb-8 drop-shadow-xl"
              priority
            />
          </motion.div>
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', delay: 0.5 }}
            className="text-5xl md:text-7xl font-bold mb-6 text-primary-50"
          >
            Welcome to Pokémon World
          </motion.h1>
          <motion.p
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-2xl mb-10 text-primary-50 max-w-xl mx-auto font-nunito"
          >
            Authentic plush toys, figures (公仔), and collectibles from the official Pokémon Center.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.2, rotate: 3 }}
            whileTap={{ scale: 0.9 }}
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 5 }}
            className="bg-blue-600 text-white px-12 py-6 rounded-full text-2xl font-bold shadow-2xl hover:bg-blue-500"
          >
            <Link href={'/shop'}>Shop Now</Link>
          </motion.button>
        </div>
      </motion.section>

      {/* Shortened Our Story */}
      <section className="py-20 px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto bg-white/80 rounded-3xl p-12 shadow-xl backdrop-blur-sm overflow-hidden"
        >
          <Image
            src="/bg-blue.jpg"
            fill
            alt="Nature Pokemon background"
            className="object-cover opacity-30 -z-10"
            priority
          />
          <h2 className="text-4xl font-bold mb-6 text-primary-900 text-center">Our Story</h2>
          <p className="text-lg text-primary-900 text-center">
            Born from a love of Pokémon, we curate genuine plush dolls and figures for fans
            everywhere.
          </p>
        </motion.div>
      </section>

      {/* Shortened Mission & Values */}
      <section className="relative py-20 px-8 bg-blue-50/50 ">
        <Image
          src="/bg-blue.jpg"
          fill
          alt="Nature Pokemon background"
          className="object-cover opacity-30 -z-10"
          priority
        />
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto bg-white/80 rounded-3xl p-12 shadow-xl backdrop-blur-sm"
        >
          <h2 className="text-4xl font-bold mb-8 text-primary-900 text-center">Our Mission</h2>
          <p className="text-lg text-center text-primary-900 mb-10">
            Deliver premium, licensed products that spark joy and adventure.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              'Quality\n100% official items',
              'Community\nConnecting fans',
              'Service\nPassionate help',
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ scale: 1.1, y: -10 }}
                className="bg-blue-100 rounded-2xl p-6 text-center shadow-lg"
              >
                <h3 className="text-xl font-bold text-primary-600">{item.split('\n')[0]}</h3>
                <p className="text-gray-700">{item.split('\n')[1]}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Expanded Gallery: Larger with more items and floating motion */}
      <section className="relative py-24 px-8">
        <Image
          src="/bg-blue.jpg"
          fill
          alt="Nature Pokemon background"
          className="object-cover opacity-30 -z-10"
          priority
        />
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-5xl font-bold mb-16 text-center text-primary-50"
        >
          Featured Collectibles
        </motion.h2>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            // Add more real plush/figure URLs here (I've used fresh ones that fit the light theme)
            1, 2, 3, 4, 5, 6, 7, 8,
          ].map((src, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80, rotate: -15 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.15, rotate: 5, y: -30 }}
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4 + index * 0.3 }}
              className="overflow-hidden rounded-3xl shadow-2xl"
            >
              <Image
                src={`/figure${src}.png`}
                alt={`Pokémon collectible ${index + 1}`}
                width={600}
                height={600}
                className="object-cover w-full h-full"
              />
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative py-20 px-8 text-center">
        <Image
          src="/nature-Pokemon.jpg"
          fill
          alt="Nature Pokemon background"
          className="object-cover opacity-30 -z-10"
          priority
        />
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
          <h2 className="text-4xl font-bold mb-6 text-primary-50">Start Your Collection</h2>
          <p className="text-xl mb-8 text-primary-5">
            Authentic pieces that bring Pokémon magic to life.
          </p>
          <motion.button
            whileHover={{ scale: 1.2 }}
            className="bg-yellow-400 text-gray-900 px-12 py-6 rounded-full text-2xl font-bold shadow-2xl hover:bg-yellow-300 z-10"
          >
            <Link href={'/shop'} className={`text-primary-50`}>
              Shop Now
            </Link>
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
