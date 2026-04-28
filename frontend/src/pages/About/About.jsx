import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { HiSparkles, HiUsers, HiLightningBolt, HiHeart } from 'react-icons/hi';

export default function About() {
    const fadeIn = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const features = [
        {
            icon: <HiUsers className="text-3xl text-primary-light" />,
            title: "Customer First",
            description: "We prioritize our customers' needs and ensure seamless venue booking experiences."
        },
        {
            icon: <HiLightningBolt className="text-3xl text-accent-gold" />,
            title: "Fast & Reliable",
            description: "Our platform is built for speed and reliability, helping you find venues in seconds."
        },
        {
            icon: <HiHeart className="text-3xl text-red-400" />,
            title: "Passionate Team",
            description: "We are a team of dedicated professionals working to make your events memorable."
        }
    ];

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 -top-[100px] -right-[100px] blur-[120px]" />
                        <div className="absolute w-[400px] h-[400px] rounded-full bg-accent-cyan/10 bottom-0 left-0 blur-[100px]" />
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ duration: 0.6 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-primary-light text-sm font-medium mb-6"
                        >
                            <HiSparkles /> About EventBook
                        </motion.div>

                        <motion.h1
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white to-text-secondary bg-clip-text text-transparent"
                        >
                            Simplifying Celebrations <br />
                            <span className="text-primary-light">One Venue at a Time</span>
                        </motion.h1>

                        <motion.p
                            initial="hidden"
                            animate="visible"
                            variants={fadeIn}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
                        >
                            We're on a mission to connect people with the perfect spaces for their most important moments. From weddings to corporate events, we make venue discovery effortless.
                        </motion.p>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-bg-secondary/30">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid md:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: index * 0.1 }}
                                    className="p-8 rounded-2xl bg-bg-card border border-border-default hover:border-primary/30 transition-all group"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-text-secondary leading-relaxed">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Story Section */}
                <section className="py-20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="bg-gradient-to-br from-primary/20 via-bg-card to-bg-card border border-border-default rounded-3xl p-10 md:p-16 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full" />

                            <div className="relative z-10 max-w-3xl">
                                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Our Story</h2>
                                <div className="space-y-6 text-text-secondary text-lg leading-relaxed">
                                    <p>
                                        Founded in 2024, EventBook started with a simple observation: finding a venue was harder than it needed to be. Endless phone calls, unclear pricing, and lack of availability information made planning events stressful.
                                    </p>
                                    <p>
                                        We built EventBook to solve this. By bringing venue owners and event planners onto a single, transparent platform, we've streamlined the entire process. Today, we host over 500+ venues across Madhya Pradesh and have helped celebrate over 10,000 events.
                                    </p>
                                    <p>
                                        Our commitment remains unchanged: to provide a hassle-free, transparent, and delightful booking experience for everyone.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
