import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Loader2, User, MapPin, Package, Truck, DollarSign, Calendar } from 'lucide-react';
import { ALL_STATUSES, getStatusConfig } from '../../utils/statusHelpers';

interface ShipmentFormData {
    senderName: string;
    senderEmail: string;
    senderPhone: string;
    senderAddress: string;
    senderCity: string;
    senderCountry: string;
    receiverName: string;
    receiverEmail: string;
    receiverPhone: string;
    receiverAddress: string;
    receiverCity: string;
    receiverCountry: string;
    shipmentType: string;
    transportMode: string;
    containsPets: boolean;
    weight: string;
    weightUnit: string;
    dimensions: string;
    description: string;
    originCity: string;
    originCountry: string;
    originLat: string;
    originLng: string;
    destinationCity: string;
    destinationCountry: string;
    destinationLat: string;
    destinationLng: string;
    estimatedDelivery: string;
    serviceType: string;
    priority: string;
    declaredValue: string;
    currency: string;
    status: string;
}

interface Props {
    defaultValues?: Partial<ShipmentFormData>;
    onSubmit: (data: ShipmentFormData) => Promise<void>;
    isLoading: boolean;
    submitLabel: string;
    isEdit?: boolean;
}

const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
    'Bahrain', 'Bangladesh', 'Belgium', 'Brazil', 'Canada', 'China',
    'Denmark', 'Egypt', 'Ethiopia', 'Finland', 'France', 'Germany',
    'Ghana', 'Greece', 'Hong Kong', 'Hungary', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan',
    'Kenya', 'Kuwait', 'Lebanon', 'Malaysia', 'Mexico', 'Morocco',
    'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman', 'Pakistan',
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia',
    'Saudi Arabia', 'Singapore', 'South Africa', 'South Korea', 'Spain',
    'Sri Lanka', 'Sweden', 'Switzerland', 'Taiwan', 'Thailand', 'Turkey',
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
    'Vietnam', 'Yemen',
].sort();

// Reusable section wrapper
function Section({ title, icon: Icon, children }: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {/* Section header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-[#0B3D91] border-b border-[#0a3380]">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-bold text-white text-sm tracking-wide uppercase">{title}</h3>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
            </div>
        </div>
    );
}

// Reusable field wrapper
function Field({
    label, required, error, children, span2,
}: {
    label: string;
    required?: boolean;
    error?: string;
    children: React.ReactNode;
    span2?: boolean;
}) {
    return (
        <div className={span2 ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <span>⚠</span> {error}
                </p>
            )}
        </div>
    );
}

const inputCls = 'w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 bg-white placeholder-gray-400 outline-none transition-all focus:border-[#0B3D91] focus:ring-2 focus:ring-[#0B3D91]/20';
const selectCls = inputCls + ' cursor-pointer';

export default function ShipmentForm({ defaultValues, onSubmit, isLoading, submitLabel, isEdit }: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ShipmentFormData>({
        defaultValues: defaultValues || {
            weightUnit: 'kg',
            shipmentType: 'package',
            transportMode: 'land',
            containsPets: false,
            serviceType: 'standard',
            priority: 'normal',
            currency: 'USD',
            status: 'created',
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            {/* ── SENDER ── */}
            <Section title="Sender Information" icon={User}>
                <Field label="Full Name" required error={errors.senderName?.message}>
                    <input
                        {...register('senderName', { required: 'Full name is required' })}
                        className={inputCls}
                        placeholder="e.g. John Smith"
                    />
                </Field>

                <Field label="Email Address">
                    <input
                        {...register('senderEmail')}
                        type="email"
                        className={inputCls}
                        placeholder="john@example.com"
                    />
                </Field>

                <Field label="Phone Number">
                    <input
                        {...register('senderPhone')}
                        className={inputCls}
                        placeholder="+1 234 567 8900"
                    />
                </Field>

                <Field label="Street Address" required error={errors.senderAddress?.message}>
                    <input
                        {...register('senderAddress', { required: 'Address is required' })}
                        className={inputCls}
                        placeholder="123 Main Street"
                    />
                </Field>

                <Field label="City" required error={errors.senderCity?.message}>
                    <input
                        {...register('senderCity', { required: 'City is required' })}
                        className={inputCls}
                        placeholder="New York"
                    />
                </Field>

                <Field label="Country" required error={errors.senderCountry?.message}>
                    <select
                        {...register('senderCountry', { required: 'Country is required' })}
                        className={selectCls}
                    >
                        <option value="">Select a country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>
            </Section>

            {/* ── RECEIVER ── */}
            <Section title="Receiver Information" icon={MapPin}>
                <Field label="Full Name" required error={errors.receiverName?.message}>
                    <input
                        {...register('receiverName', { required: 'Full name is required' })}
                        className={inputCls}
                        placeholder="e.g. Jane Doe"
                    />
                </Field>

                <Field label="Email Address">
                    <input
                        {...register('receiverEmail')}
                        type="email"
                        className={inputCls}
                        placeholder="jane@example.com"
                    />
                </Field>

                <Field label="Phone Number">
                    <input
                        {...register('receiverPhone')}
                        className={inputCls}
                        placeholder="+971 50 123 4567"
                    />
                </Field>

                <Field label="Street Address" required error={errors.receiverAddress?.message}>
                    <input
                        {...register('receiverAddress', { required: 'Address is required' })}
                        className={inputCls}
                        placeholder="456 Business Avenue"
                    />
                </Field>

                <Field label="City" required error={errors.receiverCity?.message}>
                    <input
                        {...register('receiverCity', { required: 'City is required' })}
                        className={inputCls}
                        placeholder="Dubai"
                    />
                </Field>

                <Field label="Country" required error={errors.receiverCountry?.message}>
                    <select
                        {...register('receiverCountry', { required: 'Country is required' })}
                        className={selectCls}
                    >
                        <option value="">Select a country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>
            </Section>

            {/* ── SHIPMENT DETAILS ── */}
            <Section title="Shipment Details" icon={Package}>
                <Field label="Shipment Type">
                    <select {...register('shipmentType')} className={selectCls}>
                        <option value="package">📦 Package</option>
                        <option value="document">📄 Document</option>
                        <option value="parcel">🎁 Parcel</option>
                        <option value="pallet">🏗 Pallet</option>
                        <option value="freight">🚚 Freight</option>
                        <option value="pet">🐾 Pet Shipment</option>
                    </select>
                </Field>

                <Field label="Transport Mode" error={errors.transportMode?.message}>
                    <select {...register('transportMode', { required: 'Transport mode is required' })} className={selectCls}>
                        <option value="land">Land</option>
                        <option value="air">Air</option>
                        <option value="sea">Sea</option>
                    </select>
                </Field>

                <Field label="Contains Pets">
                    <label className="inline-flex items-center gap-3 mt-1">
                        <input
                            type="checkbox"
                            {...register('containsPets')}
                            className="h-4 w-4 rounded border-gray-300 text-[#0B3D91] focus:ring-[#0B3D91]"
                        />
                        <span className="text-sm text-gray-700">This shipment contains pets</span>
                    </label>
                </Field>

                {/* Weight — fixed: two separate fields, no broken flex */}
                <Field label="Weight" required error={errors.weight?.message}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        <input
                            {...register('weight', {
                                required: 'Weight is required',
                                min: { value: 0.01, message: 'Must be greater than 0' },
                            })}
                            type="number"
                            step="0.01"
                            min="0.01"
                            style={{ flex: 1, minWidth: 0 }}
                            className={inputCls}
                            placeholder="e.g. 2.5"
                        />
                        <select
                            {...register('weightUnit')}
                            style={{ width: '80px', flexShrink: 0 }}
                            className={selectCls}
                        >
                            <option value="kg">kg</option>
                            <option value="lbs">lbs</option>
                            <option value="g">g</option>
                        </select>
                    </div>
                </Field>

                <Field label="Dimensions (L × W × H)">
                    <input
                        {...register('dimensions')}
                        className={inputCls}
                        placeholder="e.g. 30 × 20 × 15 cm"
                    />
                </Field>

                <Field label="Service Type">
                    <select {...register('serviceType')} className={selectCls}>
                        <option value="standard">Standard</option>
                        <option value="express">Express</option>
                        <option value="overnight">Overnight</option>
                        <option value="economy">Economy</option>
                        <option value="freight">Freight</option>
                    </select>
                </Field>

                <Field label="Priority Level">
                    <select {...register('priority')} className={selectCls}>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                        <option value="low">Low</option>
                    </select>
                </Field>

                {/* Declared Value — same inline-style fix */}
                <Field label="Declared Value">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch' }}>
                        <input
                            {...register('declaredValue')}
                            type="number"
                            step="0.01"
                            min="0"
                            style={{ flex: 1, minWidth: 0 }}
                            className={inputCls}
                            placeholder="e.g. 500.00"
                        />
                        <select
                            {...register('currency')}
                            style={{ width: '80px', flexShrink: 0 }}
                            className={selectCls}
                        >
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="AED">AED</option>
                            <option value="AUD">AUD</option>
                        </select>
                    </div>
                </Field>

                <Field label="Contents Description" span2>
                    <textarea
                        {...register('description')}
                        rows={2}
                        className={inputCls + ' resize-none'}
                        placeholder="Describe what's inside the shipment (e.g. Electronics - Laptop Computer)"
                    />
                </Field>

                {isEdit && (
                    <Field label="Current Status">
                        <select {...register('status')} className={selectCls}>
                            {ALL_STATUSES.map(s => (
                                <option key={s} value={s}>{getStatusConfig(s).label}</option>
                            ))}
                        </select>
                    </Field>
                )}
            </Section>

            {/* ── ROUTE ── */}
            <Section title="Route Information" icon={Truck}>
                {/* Origin */}
                <Field label="Origin City" required error={errors.originCity?.message}>
                    <input
                        {...register('originCity', { required: 'Origin city is required' })}
                        className={inputCls}
                        placeholder="e.g. Sydney"
                    />
                </Field>

                <Field label="Origin Country" required error={errors.originCountry?.message}>
                    <select
                        {...register('originCountry', { required: 'Origin country is required' })}
                        className={selectCls}
                    >
                        <option value="">Select a country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>

                <Field label="Origin Latitude">
                    <input
                        {...register('originLat')}
                        type="number"
                        step="any"
                        className={inputCls}
                        placeholder="e.g. -33.8688"
                    />
                </Field>

                <Field label="Origin Longitude">
                    <input
                        {...register('originLng')}
                        type="number"
                        step="any"
                        className={inputCls}
                        placeholder="e.g. 151.2093"
                    />
                </Field>

                {/* Destination */}
                <Field label="Destination City" required error={errors.destinationCity?.message}>
                    <input
                        {...register('destinationCity', { required: 'Destination city is required' })}
                        className={inputCls}
                        placeholder="e.g. Dubai"
                    />
                </Field>

                <Field label="Destination Country" required error={errors.destinationCountry?.message}>
                    <select
                        {...register('destinationCountry', { required: 'Destination country is required' })}
                        className={selectCls}
                    >
                        <option value="">Select a country</option>
                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </Field>

                <Field label="Destination Latitude">
                    <input
                        {...register('destinationLat')}
                        type="number"
                        step="any"
                        className={inputCls}
                        placeholder="e.g. 25.2048"
                    />
                </Field>

                <Field label="Destination Longitude">
                    <input
                        {...register('destinationLng')}
                        type="number"
                        step="any"
                        className={inputCls}
                        placeholder="e.g. 55.2708"
                    />
                </Field>
            </Section>

            {/* ── SCHEDULE ── */}
            <Section title="Delivery Schedule" icon={Calendar}>
                <Field label="Estimated Delivery Date & Time" span2>
                    <input
                        {...register('estimatedDelivery')}
                        type="datetime-local"
                        className={inputCls}
                    />
                </Field>
            </Section>

            {/* ── SUBMIT ── */}
            <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: isLoading ? 1 : 1.01 }}
                whileTap={{ scale: isLoading ? 1 : 0.99 }}
                className="w-full py-4 bg-[#0B3D91] hover:bg-[#0a3380] text-white font-bold rounded-2xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-base"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                    </>
                ) : (
                    <>
                        <Package className="w-5 h-5" />
                        {submitLabel}
                    </>
                )}
            </motion.button>
        </form>
    );
}
