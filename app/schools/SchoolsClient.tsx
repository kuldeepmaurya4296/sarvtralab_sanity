
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Check, ArrowRight,
    Phone, Crown, Sparkles, Eye, Shield, CheckCircle2, X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as Icons from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getUserActivePlan } from '@/lib/actions/plan.actions';

const IconComponent = ({ name, className }: { name: string; className?: string }) => {
    const Icon = (Icons as any)[name];
    if (!Icon) return null;
    return <Icon className={className} />;
};

interface SchoolsClientProps {
    plans: any[];
    organization: any;
    benefits: any[];
}

const MAX_VISIBLE_FEATURES = 6;

export default function SchoolsClient({ plans, organization, benefits }: SchoolsClientProps) {
    const phone = organization?.phone || '+91-8085613350';
    const partnerStudentsStat = organization?.stats?.find((s: any) => s.label.includes('Partner'))?.value || '120+';

    const { user } = useAuth();
    const router = useRouter();

    const [userActivePlanId, setUserActivePlanId] = useState<string | null>(null);
    const [isLoadingPlan, setIsLoadingPlan] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Fetch user's active plan if logged in
    useEffect(() => {
        const fetchActivePlan = async () => {
            if (user?.id) {
                setIsLoadingPlan(true);
                try {
                    const activePlan = await getUserActivePlan(user.id);
                    setUserActivePlanId(activePlan);
                } catch (e) {
                    console.error("Error fetching user plan:", e);
                } finally {
                    setIsLoadingPlan(false);
                }
            }
        };
        fetchActivePlan();
    }, [user]);

    const isPlanPurchased = (plan: any) => {
        if (!userActivePlanId) return false;
        const planId = plan.customId || plan._id || plan.id;
        return userActivePlanId === planId;
    };

    const handleGetStarted = (plan: any) => {
        const planId = plan.customId || plan._id || plan.id;
        if (!user) {
            router.push(`/login?redirect=/checkout/plan/${planId}`);
            return;
        }
        router.push(`/checkout/plan/${planId}`);
    };

    return (
        <>
            {/* Hero Section */}
            <section className="pt-32 pb-20 relative overflow-hidden bg-foreground">


                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-2xl"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-semibold mb-4 text-sm">For Schools</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-background mb-6">
                            Partner with India&apos;s Leading
                            <span className="block text-primary">Robotics Education Platform</span>
                        </h1>
                        <p className="text-lg text-gray-300 mb-8">
                            Transform your school&apos;s STEM program with our comprehensive robotics curriculum,
                            training, and support. Join {partnerStudentsStat} partner schools across India.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="w-full sm:w-auto h-12 text-lg font-semibold bg-primary hover:bg-primary/90" asChild>
                                <Link href="/contact">
                                    Request Demo
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 text-lg text-white border-white/20 cursor-pointer bg-white/10" asChild>
                                <a href={`tel:${phone.replace(/\s+/g, '')}`}>
                                    <Phone className="w-5 h-5 mr-2" />
                                    {phone}
                                </a>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            {/* <section className="py-12 bg-primary">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {organization?.stats?.map((stat: any, index: number) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="text-center"
                            >
                                <p className="text-3xl md:text-4xl font-bold text-primary-foreground">{stat.value}</p>
                                <p className="text-primary-foreground/70">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section> */}

            {/* Benefits */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Partner with Sarvtra Labs?</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to deliver world-class robotics education
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits && benefits.length > 0 ? benefits.slice(0, 4).map((benefit: any, index: number) => (
                            <motion.div
                                key={benefit.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-6 rounded-2xl bg-muted/50 hover:bg-muted transition-colors"
                            >
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <IconComponent name={benefit.icon || 'GraduationCap'} className="w-7 h-7 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                                <p className="text-muted-foreground">{benefit.description}</p>
                            </motion.div>
                        )) : (
                            <div className="col-span-full py-20 text-center text-muted-foreground">
                                Loading benefits...
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">School Partnership Plans</h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Flexible plans designed for schools of all sizes
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {plans && plans.length > 0 ? plans.map((plan, index) => {
                            const purchased = isPlanPurchased(plan);
                            const features = plan.features || [];
                            const visibleFeatures = features.slice(0, MAX_VISIBLE_FEATURES);
                            const hasMoreFeatures = features.length > MAX_VISIBLE_FEATURES;

                            return (
                                <motion.div
                                    key={plan._id || plan.id || plan.customId || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`rounded-2xl bg-card border-2 relative transition-all hover:-translate-y-2 flex flex-col ${plan.popular ? 'border-primary shadow-xl ring-2 ring-primary/20' : 'border-transparent shadow-lg'
                                        }`}
                                >
                                    {plan.popular && (
                                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-sm font-semibold rounded-full shadow-md flex items-center gap-1 z-10">
                                            <Crown className="w-3.5 h-3.5" />
                                            Most Popular
                                        </span>
                                    )}

                                    {/* Card Body — fixed height sections */}
                                    <div className="p-8 flex flex-col flex-1">
                                        {/* Title + Description  (fixed min-height) */}
                                        <div className="min-h-[72px]">
                                            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2">{plan.description}</p>
                                        </div>

                                        {/* Price */}
                                        <div className="my-5">
                                            <span className="text-4xl font-bold">{plan.price}</span>
                                            {plan.period && (
                                                <span className="text-muted-foreground ml-1">/{plan.period}</span>
                                            )}
                                        </div>

                                        {/* Features  (fixed height container) */}
                                        <div className="min-h-[160px] flex flex-col">
                                            <ul className="space-y-2.5 flex-1">
                                                {visibleFeatures.map((feature: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <Check className="w-4.5 h-4.5 text-green-500 mt-0.5 shrink-0" />
                                                        <span className="text-sm">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            {/* "More" button — only appears when features > limit */}
                                            {hasMoreFeatures && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedPlan(plan);
                                                        setIsDetailOpen(true);
                                                    }}
                                                    className="mt-3 text-sm text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors hover:text-primary/80"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    +{features.length - MAX_VISIBLE_FEATURES} more features
                                                </button>
                                            )}
                                        </div>

                                        {/* Action Button — always at the bottom */}
                                        <div className="mt-6 pt-4 border-t">
                                            {purchased ? (
                                                <div className="w-full h-12 rounded-lg bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center gap-2">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                                    <span className="font-semibold text-emerald-700">Already Purchased</span>
                                                </div>
                                            ) : (
                                                <Button
                                                    className="w-full h-12 font-medium text-base"
                                                    variant={plan.popular ? 'default' : 'outline'}
                                                    onClick={() => handleGetStarted(plan)}
                                                >
                                                    Get Started
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        }) : (
                            <div className="col-span-full py-20 text-center text-muted-foreground">
                                No plans available at the moment.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-primary to-accent">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                        Ready to Transform Your School&apos;s STEM Program?
                    </h2>
                    <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
                        Schedule a free demo to see how Sarvtra Labs can help your students excel in robotics and coding.
                    </p>
                    <Button size="lg" variant="secondary" className="text-lg font-semibold h-14 px-8" asChild>
                        <Link href="/contact">
                            Schedule Free Demo
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </Button>
                </div>
            </section>

            {/* Plan Detail Dialog */}
            <PlanDetailDialog
                plan={selectedPlan}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
                isPurchased={selectedPlan ? isPlanPurchased(selectedPlan) : false}
                onGetStarted={() => {
                    if (selectedPlan) {
                        setIsDetailOpen(false);
                        handleGetStarted(selectedPlan);
                    }
                }}
            />
        </>
    );
}

// ────────────────────────────────────────────────────────────────────
// Plan Detail Dialog
// ────────────────────────────────────────────────────────────────────
function PlanDetailDialog({ plan, open, onOpenChange, isPurchased, onGetStarted }: {
    plan: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isPurchased: boolean;
    onGetStarted: () => void;
}) {
    if (!plan) return null;

    const features = plan.features || [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>{plan.name} - Plan Details</DialogTitle>
                    <DialogDescription className="sr-only">
                        Detailed information about the {plan.name} partnership plan.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="h-[85vh]">
                    <div className="p-6 space-y-6">
                        {/* Plan Header */}
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                                <Shield className="w-8 h-8 text-primary" />
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <h2 className="text-2xl font-bold">{plan.name}</h2>
                                    {plan.popular && (
                                        <Badge className="bg-primary text-primary-foreground">
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Popular
                                        </Badge>
                                    )}
                                </div>
                                {plan.description && (
                                    <p className="text-muted-foreground text-sm">{plan.description}</p>
                                )}
                            </div>
                            <div className="pt-2">
                                <span className="text-4xl font-bold text-primary">{plan.price}</span>
                                {plan.period && (
                                    <span className="text-muted-foreground ml-1">/{plan.period}</span>
                                )}
                            </div>
                        </div>

                        <Separator />

                        {/* All Features */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary" />
                                All Features & Benefits
                            </h3>
                            <ul className="space-y-2.5">
                                {features.map((feature: string, i: number) => (
                                    <li key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-muted/40 border">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                        <span className="text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <Separator />

                        {/* Action */}
                        <div className="pb-2">
                            {isPurchased ? (
                                <div className="w-full h-12 rounded-lg bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                    <span className="font-semibold text-emerald-700">You already have this plan</span>
                                </div>
                            ) : (
                                <Button
                                    className="w-full h-12 font-semibold text-base"
                                    onClick={onGetStarted}
                                >
                                    Get Started with {plan.name}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
