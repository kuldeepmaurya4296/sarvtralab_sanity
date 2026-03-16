
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { createRazorpayOrder, verifyPayment } from '@/lib/actions/payment.actions';
import { getCourseById } from '@/lib/actions/course.actions';
import { getPlanById } from '@/lib/actions/plan.actions';

export default function CheckoutPage() {
    const params = useParams();
    const type = params?.type as string; // 'course' or 'plan'
    const id = params?.id as string;

    const { user, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    const [itemDetails, setItemDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    useEffect(() => {
        const fetchItemDetails = async () => {
            if (type === 'plan') {
                try {
                    const plan = await getPlanById(id);
                    if (plan) {
                        // Parse price: handle strings like "₹4,999" or "4999" or numeric values
                        let numericPrice = 0;
                        if (typeof plan.price === 'number') {
                            numericPrice = plan.price;
                        } else if (typeof plan.price === 'string') {
                            numericPrice = parseFloat(plan.price.replace(/[₹,\s]/g, '')) || 0;
                        }
                        setItemDetails({
                            id: plan.customId || plan._id || plan.id,
                            name: plan.name,
                            price: numericPrice,
                            displayPrice: plan.price,
                            features: plan.features || [],
                            period: plan.period || 'yearly',
                            description: plan.description
                        });
                    } else {
                        toast.error("Plan not found");
                        router.push('/schools');
                    }
                } catch (e) {
                    console.error(e);
                    toast.error("Error loading plan");
                    router.push('/schools');
                } finally {
                    setIsLoading(false);
                }
            } else if (type === 'course') {
                try {
                    const course = await getCourseById(id);
                    if (course) {
                        setItemDetails({
                            id: course.id,
                            name: course.title,
                            price: course.price,
                            features: course.features || ['Full access', 'Certificate', 'Projects']
                        });
                    } else {
                        toast.error("Course not found");
                        router.push('/courses');
                    }
                } catch (e) {
                    console.error(e);
                    toast.error("Error loading course");
                } finally {
                    setIsLoading(false);
                }
            }
        };

        if (id && type) {
            fetchItemDetails();
        }
    }, [type, id, router]);

    const handlePayment = async () => {
        if (!user) {
            toast.error("Please login to continue");
            router.push('/login?redirect=/checkout/' + type + '/' + id);
            return;
        }

        if (!acceptedTerms) {
            toast.error("Please accept the terms and conditions");
            return;
        }

        setIsProcessing(true);

        try {
            const totalAmount = itemDetails.price * 1.18;
            const paymentNotes = {
                userId: user.id,
                itemId: id,
                itemType: type,
                amount: totalAmount
            };

            // 1. Create Order
            const order = await createRazorpayOrder(totalAmount, 'INR', 'receipt_' + Date.now(), paymentNotes);

            if (!order || !order.id) {
                throw new Error("Failed to create order");
            }

            // 2. Open Razorpay Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
                amount: order.amount,
                currency: order.currency,
                name: "Sarvtra Labs",
                description: `Purchase of ${itemDetails.name}`,
                image: "/favicon.svg", // Add your logo here
                order_id: order.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await verifyPayment(
                            response.razorpay_order_id,
                            response.razorpay_payment_id,
                            response.razorpay_signature,
                            user.id,
                            id,
                            type, // Pass 'course' or 'plan'
                            totalAmount
                        );

                        if (verifyRes.success) {
                            toast.success("Payment successful!");

                            // Redirect based on user role
                            if (user?.role) {
                                switch (user.role) {
                                    case 'student': router.push('/student/dashboard'); break;
                                    case 'school': router.push('/school/dashboard'); break;
                                    case 'teacher': router.push('/teacher/dashboard'); break;
                                    case 'govt': router.push('/govt/dashboard'); break;
                                    case 'superadmin': router.push('/admin/dashboard'); break;
                                    case 'helpsupport': router.push('/helpsupport/dashboard'); break;
                                    default: router.push('/student/dashboard');
                                }
                            } else {
                                router.push('/student/dashboard');
                            }
                        } else {
                            toast.error(verifyRes.message || "Payment verification failed.");
                        }
                    } catch (error) {
                        console.error(error);
                        toast.error("Error verifying payment");
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: '', // potentialUser.phone
                },
                notes: {
                    address: "Sarvtra Labs Corporate Office",
                    ...paymentNotes
                },
                theme: {
                    color: "#3399cc"
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.on('payment.failed', function (response: any) {
                toast.error(response.error.description || "Payment failed");
            });
            rzp1.open();

        } catch (error) {
            console.error("Payment Error:", error);
            toast.error("Failed to initiate payment");
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading || isAuthLoading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!itemDetails) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-muted/50 to-background py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-96 bg-primary/5 rounded-b-[100px] blur-3xl -z-10" />
            <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10 translate-x-1/2" />

            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

            <div className="max-w-5xl mx-auto relative z-10">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8 hover:bg-transparent hover:text-primary pl-0 text-muted-foreground transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to {type === 'plan' ? 'Plans' : 'Courses'}
                </Button>

                <div className="text-center mb-12">
                    <motion.h1 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-black tracking-tight mb-4"
                    >
                        Secure <span className="text-primary">Checkout</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-muted-foreground max-w-2xl mx-auto"
                    >
                        You are one step away from unlocking premium {type === 'plan' ? 'partnership features' : 'course content'}. Complete your purchase below.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Main Content Area */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                        {/* Order Summary Card */}
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card rounded-3xl border border-border/60 shadow-xl shadow-black/5 overflow-hidden"
                        >
                            <div className="p-8 border-b bg-muted/20">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <ShieldCheck className="w-7 h-7 text-primary" />
                                    Order Summary
                                </h2>
                            </div>
                            
                            <div className="p-8">
                                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-8 border-b mb-8">
                                    <div className="w-24 h-24 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center shrink-0">
                                        <Check className="w-10 h-10 text-primary" />
                                    </div>
                                    <div>
                                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-semibold text-xs uppercase tracking-wider mb-3">
                                            {type === 'plan' ? 'Subscription Plan' : 'Online Course'}
                                        </div>
                                        <h3 className="font-bold text-2xl lg:text-3xl mb-2 text-foreground">{itemDetails.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {itemDetails.features?.slice(0, 4).map((feature: string, i: number) => (
                                                <span key={i} className="text-[11px] font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-md border">
                                                    {feature}
                                                </span>
                                            ))}
                                            {(itemDetails.features?.length > 4) && (
                                                <span className="text-[11px] font-medium bg-muted text-muted-foreground px-2.5 py-1 rounded-md border">
                                                    +{itemDetails.features.length - 4} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex justify-between items-center text-lg text-muted-foreground">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-foreground">₹{itemDetails.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-lg text-muted-foreground">
                                        <span>Tax (18% GST)</span>
                                        <span className="font-medium text-foreground">₹{(itemDetails.price * 0.18).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-2xl font-black mt-6 pt-6 border-t border-dashed">
                                        <span>Total Amount</span>
                                        <span className="text-primary bg-primary/10 px-4 py-2 rounded-xl">
                                            ₹{(itemDetails.price * 1.18).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sticky Sidebar / Payment Action */}
                    <div className="lg:col-span-5 xl:col-span-4">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-card rounded-3xl border border-primary/20 shadow-2xl p-8 sticky top-24"
                        >
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm">₹</span>
                                Payment Details
                            </h3>
                            
                            <div className="bg-muted/40 border rounded-2xl p-5 mb-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border flex items-center justify-center">
                                       <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-blue-600" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11 19.93C7.05 19.43 4 16.05 4 12C4 7.95 7.05 4.57 11 4.07V19.93ZM13 4.07C16.95 4.57 20 7.95 20 12C20 16.05 16.95 19.43 13 19.93V4.07Z" fill="currentColor"/></svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-foreground">Razorpay Secure</p>
                                        <p className="text-xs text-muted-foreground">UPI, Cards, NetBanking</p>
                                    </div>
                                </div>
                                <div className="flex gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                                    <Check className="w-4 h-4 text-emerald-500" />
                                    <span>Encrypted & secure connection</span>
                                </div>
                            </div>
                            
                            {/* Terms & Conditions Checkbox */}
                            <div className="mb-6 bg-muted/20 border border-border/60 rounded-xl p-4 flex items-start gap-3">
                                <div className="relative flex items-center shrink-0 mt-0.5">
                                    <input
                                        type="checkbox"
                                        id="terms-checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-muted-foreground/30 shadow-sm transition-all checked:bg-primary checked:border-primary hover:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                    <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary-foreground opacity-0 pointer-events-none peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <div className="space-y-0.5">
                                    <label htmlFor="terms-checkbox" className="text-sm font-semibold cursor-pointer text-foreground block">
                                        Accept Terms
                                    </label>
                                    <p className="text-xs text-muted-foreground leading-tight">
                                        I agree to the <Link href="/terms" target="_blank" className="text-primary hover:underline">Terms of Service</Link>, <Link href="/privacy" target="_blank" className="text-primary hover:underline">Privacy Policy</Link>, and <Link href="/refund" target="_blank" className="text-primary hover:underline">Refund Policy</Link>.
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handlePayment}
                                className={`w-full h-14 text-lg font-bold rounded-xl transition-all hover:scale-[1.02] group relative overflow-hidden ${
                                    !acceptedTerms || isProcessing
                                        ? 'bg-muted text-muted-foreground shadow-none cursor-not-allowed hover:bg-muted hover:scale-100'
                                        : 'shadow-lg shadow-primary/25 cursor-pointer'
                                }`}
                                disabled={isProcessing || !acceptedTerms}
                            >
                                {(!acceptedTerms && !isProcessing) ? <span className="absolute inset-0 w-full h-full bg-transparent" /> : <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />}
                                
                                {isProcessing ? (
                                    <span className="flex items-center">
                                        <Loader2 className="w-6 h-6 animate-spin mr-3" />
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center w-full">
                                        Pay ₹{(itemDetails.price * 1.18).toLocaleString()}
                                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>

                            <div className="mt-6 flex flex-col items-center gap-3">
                                <p className="text-[11px] text-center text-muted-foreground/80 leading-relaxed">
                                    By clicking "Pay", you will be redirected to Razorpay's secure checkout gateway.
                                </p>
                                <div className="flex gap-4 opacity-50">
                                    <div className="text-[9px] font-bold tracking-widest uppercase border border-foreground/10 px-2 py-1 rounded">256-bit TLS</div>
                                    <div className="text-[9px] font-bold tracking-widest uppercase border border-foreground/10 px-2 py-1 rounded">PCI-DSS</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
