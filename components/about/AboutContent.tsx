
'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Target, Users, Trophy, Heart, Lightbulb, Star, Shield, Zap } from 'lucide-react';
import Image from 'next/image';

const iconMap: Record<string, any> = {
    'Heart': Heart,
    'Lightbulb': Lightbulb,
    'Users': Users,
    'Trophy': Trophy,
    'Star': Star,
    'Shield': Shield,
    'Zap': Zap,
    'Target': Target,
    'GraduationCap': GraduationCap
};

export default function AboutContent({ organization, team }: { organization: any, team: any[] }) {
    const displayTeam = team && team.length > 0 ? team : [];

    const values = organization?.values || [
        {
            icon: 'Heart',
            title: 'Passion for Education',
            description: 'We believe every student deserves access to quality STEM education'
        },
        {
            icon: 'Lightbulb',
            title: 'Innovation First',
            description: 'Constantly evolving our curriculum to match industry trends'
        },
        {
            icon: 'Users',
            title: 'Community Driven',
            description: 'Building a network of learners, educators, and innovators'
        },
        {
            icon: 'Trophy',
            title: 'Excellence Always',
            description: 'Committed to delivering the best learning outcomes'
        }
    ];

    const milestones = organization?.milestones || [
        { year: '2019', event: 'Sarvtra Labs founded in Bhopal' },
        { year: '2020', event: 'First 10 school partnerships' },
        { year: '2021', event: 'Launched online learning platform' },
        { year: '2022', event: 'Expanded to 10 states' },
        { year: '2023', event: 'CBSE official curriculum partner' },
        { year: '2024', event: '15,000+ students trained' }
    ];

    return (
        <>
            {/* Hero */}
            <section className="pt-32 pb-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold mb-4 text-sm">About Us</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Empowering the Next Generation of
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Innovators & Engineers</span>
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {organization?.description || "Sarvtra Labs is India's premier robotics education platform, dedicated to making STEM education accessible, engaging, and aligned with global standards."}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission & Vision */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-muted aspect-video rounded-2xl shadow-xl overflow-hidden relative"
                        >
                            <Image
                                src="/students-success.jpg"
                                alt="Students learning at Sarvtra Labs"
                                fill
                                className="object-cover"
                            />
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Target className="w-6 h-6 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Our Mission</h2>
                                </div>
                                <p className="text-muted-foreground">
                                    {organization?.mission || "To democratize robotics and coding education in India by providing affordable, high-quality, and curriculum-aligned learning experiences that prepare students for the future of technology."}
                                </p>
                            </div>
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                                        <GraduationCap className="w-6 h-6 text-orange-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold">Our Vision</h2>
                                </div>
                                <p className="text-muted-foreground">
                                    {organization?.vision || "To become India's most trusted robotics education partner, reaching 1 million students by 2030 and creating a new generation of innovators, problem-solvers, and technology leaders."}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            The principles that guide everything we do
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value: any, index: number) => {
                            const Icon = iconMap[value.icon] || Heart;
                            return (
                                <motion.div
                                    key={value.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="p-6 rounded-2xl bg-card border text-center hover:shadow-md transition-shadow"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                        <Icon className="w-7 h-7 text-primary" />
                                    </div>
                                    <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                                    <p className="text-sm text-muted-foreground">{value.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            From a small startup to India's leading robotics education platform
                        </p>
                    </div>
                    <div className="max-w-3xl mx-auto">
                        {milestones.map((milestone: any, index: number) => (
                            <motion.div
                                key={milestone.year}
                                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-12 last:mb-0 relative"
                            >
                                <div className="w-24 sm:w-20 text-center sm:text-right shrink-0">
                                    <span className="text-2xl sm:text-xl font-bold text-primary">{milestone.year}</span>
                                </div>
                                <div className="hidden sm:flex flex-col items-center">
                                    <div className="w-4 h-4 rounded-full bg-primary relative z-10 box-content border-4 border-background" />
                                    {index < milestones.length - 1 && (
                                        <div className="w-0.5 h-full bg-muted-foreground/30 absolute top-4 translate-y-2 pb-8" />
                                    )}
                                </div>
                                <div className="flex-1 p-5 rounded-2xl bg-card border shadow-sm relative w-full">
                                    <div className="sm:hidden absolute -top-2 left-6 w-4 h-4 rounded-full bg-primary border-4 border-background" />
                                    <p className="font-medium text-foreground leading-relaxed">{milestone.event}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Passionate educators and technologists dedicated to transforming education
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {displayTeam.map((member: any, index: number) => (
                            <motion.div
                                key={member._id || member.id || index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-4 overflow-hidden border-4 border-card shadow-lg relative">
                                    {member.image ? (
                                        <Image src={member.image} alt={member.name} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground absolute inset-0">
                                            <Users className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold">{member.name}</h3>
                                <p className="text-primary text-sm mb-2">{member.role}</p>
                                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">{member.bio}</p>
                            </motion.div>
                        ))}
                        {displayTeam.length === 0 && (
                            <div className="col-span-full py-20 text-center text-muted-foreground">
                                Loading team members...
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
