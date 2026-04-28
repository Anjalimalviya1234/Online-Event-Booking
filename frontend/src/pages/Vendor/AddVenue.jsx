import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import axios from 'axios';
import { HiArrowLeft, HiOfficeBuilding, HiLocationMarker, HiCurrencyRupee, HiUsers, HiPhotograph, HiCheck, HiPlus, HiTrash, HiX } from 'react-icons/hi';
import { useVenueActions, useCities } from '../../hooks/useVenues';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const venueTypes = ['banquet', 'lawn', 'resort', 'hotel', 'farmhouse', 'community-hall', 'marriage-garden'];
const occasionsList = ['wedding', 'reception', 'engagement', 'birthday', 'corporate', 'conference', 'party', 'anniversary', 'other'];

const emptyFormData = {
    name: '',
    description: '',
    venueType: 'banquet',
    occasions: [],
    city: '',
    area: '',
    address: '',
    capacity: { min: 50, max: 500 },
    startingPrice: '',
    pricePerPlate: '',
    amenities: {
        parking: false,
        ac: false,
        wifi: false,
        dj: false,
        cateringAvailable: false,
        decorationAvailable: false,
        alcoholAllowed: false,
        rooms: 0
    },
    images: [],
    packages: [],
    foodMenu: []
};

export default function AddVenue() {
    const navigate = useNavigate();
    const { id: venueId } = useParams();
    const isEditMode = Boolean(venueId);
    const { createVenue, updateVenue, uploadImages } = useVenueActions();
    const availableCities = useCities();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fetchingVenue, setFetchingVenue] = useState(false);
    const [isCustomCity, setIsCustomCity] = useState(false);
    const [formData, setFormData] = useState({ ...emptyFormData });

    // Fetch venue data when editing
    useEffect(() => {
        if (isEditMode && venueId) {
            const fetchVenue = async () => {
                setFetchingVenue(true);
                try {
                    const { data } = await axios.get(`${API_URL}/venues/${venueId}`, { withCredentials: true });
                    if (data.success && data.venue) {
                        const v = data.venue;
                        setFormData({
                            name: v.name || '',
                            description: v.description || '',
                            venueType: v.venueType || 'banquet',
                            occasions: v.occasions || [],
                            city: v.city || '',
                            area: v.area || '',
                            address: v.address || '',
                            capacity: {
                                min: v.capacity?.min || 50,
                                max: v.capacity?.max || 500
                            },
                            startingPrice: v.startingPrice || '',
                            pricePerPlate: v.pricePerPlate || '',
                            amenities: {
                                parking: v.amenities?.parking || false,
                                ac: v.amenities?.ac || false,
                                wifi: v.amenities?.wifi || false,
                                dj: v.amenities?.dj || false,
                                cateringAvailable: v.amenities?.cateringAvailable || false,
                                decorationAvailable: v.amenities?.decorationAvailable || false,
                                alcoholAllowed: v.amenities?.alcoholAllowed || false,
                                rooms: v.amenities?.rooms || 0
                            },
                            images: v.images?.map(img => typeof img === 'string' ? img : img.url) || [],
                            packages: v.packages?.map(p => ({
                                name: p.name || '',
                                price: p.price || '',
                                description: p.description || '',
                                includes: Array.isArray(p.includes) ? p.includes.join(', ') : (p.includes || '')
                            })) || [],
                            foodMenu: v.foodMenu || []
                        });
                    }
                } catch (err) {
                    toast.error('Failed to load venue details');
                    navigate('/vendor/dashboard');
                } finally {
                    setFetchingVenue(false);
                }
            };
            fetchVenue();
        }
    }, [isEditMode, venueId]);

    // In edit mode, if venue city is not in available cities -> show custom input
    useEffect(() => {
        if (isEditMode && formData.city && availableCities.length > 0) {
            const cityExists = availableCities.some(c => c.toLowerCase() === formData.city.toLowerCase());
            if (!cityExists) {
                setIsCustomCity(true);
            }
        }
    }, [isEditMode, formData.city, availableCities]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Package Handlers
    const addPackage = () => {
        setFormData(prev => ({
            ...prev,
            packages: [...prev.packages, { name: '', price: '', description: '', includes: '' }]
        }));
    };

    const updatePackage = (index, field, value) => {
        const newPackages = [...formData.packages];
        newPackages[index][field] = value;
        setFormData(prev => ({ ...prev, packages: newPackages }));
    };

    const removePackage = (index) => {
        setFormData(prev => ({
            ...prev,
            packages: prev.packages.filter((_, i) => i !== index)
        }));
    };

    // Food Menu Handlers
    const addMenuCategory = () => {
        setFormData(prev => ({
            ...prev,
            foodMenu: [...prev.foodMenu, { category: '', items: [] }]
        }));
    };

    const updateMenuCategory = (index, value) => {
        const newMenu = [...formData.foodMenu];
        newMenu[index].category = value;
        setFormData(prev => ({ ...prev, foodMenu: newMenu }));
    };

    const addMenuItem = (catIndex) => {
        const newMenu = [...formData.foodMenu];
        newMenu[catIndex].items.push({ name: '', price: '', isVeg: true });
        setFormData(prev => ({ ...prev, foodMenu: newMenu }));
    };

    const updateMenuItem = (catIndex, itemIndex, field, value) => {
        const newMenu = [...formData.foodMenu];
        newMenu[catIndex].items[itemIndex][field] = value;
        setFormData(prev => ({ ...prev, foodMenu: newMenu }));
    };

    const removeMenuItem = (catIndex, itemIndex) => {
        const newMenu = [...formData.foodMenu];
        newMenu[catIndex].items = newMenu[catIndex].items.filter((_, i) => i !== itemIndex);
        setFormData(prev => ({ ...prev, foodMenu: newMenu }));
    };

    const removeMenuCategory = (index) => {
        setFormData(prev => ({
            ...prev,
            foodMenu: prev.foodMenu.filter((_, i) => i !== index)
        }));
    };

    const handleArrayToggle = (item, arrayName) => {
        setFormData(prev => {
            const array = prev[arrayName];
            return {
                ...prev,
                [arrayName]: array.includes(item)
                    ? array.filter(i => i !== item)
                    : [...array, item]
            };
        });
    };

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const data = await uploadImages(files);

            if (data && data.success) {
                const newUrls = data.images.map(img => img.url);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newUrls]
                }));
                toast.success('Images uploaded successfully');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload images');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Format data for backend
            const payload = {
                ...formData,
                images: formData.images.filter(url => url && url.trim() !== '').map((url, i) => ({ url, isMain: i === 0 })),
                startingPrice: Number(formData.startingPrice),
                pricePerPlate: Number(formData.pricePerPlate) || 0,
                capacity: {
                    min: Number(formData.capacity.min),
                    max: Number(formData.capacity.max)
                },
                amenities: {
                    ...formData.amenities,
                    rooms: Number(formData.amenities.rooms)
                },
                packages: formData.packages.map(p => ({
                    ...p,
                    price: Number(p.price),
                    includes: typeof p.includes === 'string' ? p.includes.split(',').map(s => s.trim()).filter(Boolean) : p.includes
                })),
                foodMenu: formData.foodMenu.map(cat => ({
                    ...cat,
                    items: cat.items.map(item => ({
                        ...item,
                        price: Number(item.price)
                    }))
                }))
            };

            let data;
            if (isEditMode) {
                data = await updateVenue(venueId, payload);
            } else {
                data = await createVenue(payload);
            }

            if (data && data.success) {
                toast.success(isEditMode ? 'Venue updated successfully!' : 'Venue listed successfully!');
                navigate('/vendor/dashboard');
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(isEditMode ? 'Failed to update venue' : 'Failed to list venue');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-4 py-3 bg-white/[0.03] border border-border-default rounded-xl text-white text-sm outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(108,60,225,0.15)] transition-all";
    const labelCls = "block text-sm font-medium text-text-muted mb-2";

    if (fetchingVenue) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-text-muted">Loading venue details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary pb-20 pt-10">
            <div className="max-w-4xl mx-auto px-6">
                <Link to="/vendor/dashboard" className="inline-flex items-center gap-2 text-text-secondary hover:text-white mb-6 transition-colors">
                    <HiArrowLeft /> Back to Dashboard
                </Link>

                <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden">
                    <div className={`p-8 border-b border-border-default bg-gradient-to-r ${isEditMode ? 'from-accent-emerald/10 to-transparent' : 'from-primary/10 to-transparent'}`}>
                        <h1 className="text-2xl font-bold text-white">{isEditMode ? 'Edit Venue' : 'List Your Venue'}</h1>
                        <p className="text-text-muted mt-1">{isEditMode ? 'Update your venue details below' : 'Fill in the details to start accepting bookings'}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {/* Basic Info */}
                        <div className="space-y-6 mb-8">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm">1</span>
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                                <div className="col-span-2">
                                    <label className={labelCls}>Venue Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={inputCls} placeholder="e.g. Royal Palace Garden" required />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelCls}>Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className={`${inputCls} min-h-[100px]`} placeholder="Describe your venue..." required />
                                </div>
                                <div>
                                    <label className={labelCls}>Venue Type</label>
                                    <select name="venueType" value={formData.venueType} onChange={handleChange} className={inputCls} required>
                                        {venueTypes.map(t => <option key={t} value={t} className="bg-bg-card">{t.replace('-', ' ').toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Suitable for Occasions</label>
                                <div className="flex flex-wrap gap-3">
                                    {occasionsList.map(occ => (
                                        <button
                                            key={occ}
                                            type="button"
                                            onClick={() => handleArrayToggle(occ, 'occasions')}
                                            className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${formData.occasions.includes(occ)
                                                ? 'bg-primary text-white border-primary'
                                                : 'bg-transparent text-text-secondary border-border-default hover:border-text-muted'
                                                }`}
                                        >
                                            {occ.charAt(0).toUpperCase() + occ.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-6 mb-8 pt-8 border-t border-border-default">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm">2</span>
                                Location
                            </h3>
                            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                                <div>
                                    <label className={labelCls}>City</label>
                                    {isCustomCity ? (
                                        <div className="flex gap-2">
                                            <input type="text" name="city" value={formData.city} onChange={handleChange} className={`${inputCls} flex-1`} placeholder="Enter city name" required />
                                            <button type="button" onClick={() => { setIsCustomCity(false); setFormData(prev => ({ ...prev, city: '' })); }} className="px-3 py-2 text-text-muted hover:text-white border border-border-default rounded-xl text-xs transition-all">
                                                <HiX />
                                            </button>
                                        </div>
                                    ) : (
                                        <select name="city" value={formData.city} onChange={(e) => { if (e.target.value === '__other__') { setIsCustomCity(true); setFormData(prev => ({ ...prev, city: '' })); } else { setFormData(prev => ({ ...prev, city: e.target.value })); } }} className={inputCls} required>
                                            <option value="" className="bg-bg-card">Select City</option>
                                            {availableCities.map(c => <option key={c} value={c} className="bg-bg-card">{c}</option>)}
                                            <option value="__other__" className="bg-bg-card">+ Other (Add New City)</option>
                                        </select>
                                    )}
                                </div>
                                <div><label className={labelCls}>Area</label><input type="text" name="area" value={formData.area} onChange={handleChange} className={inputCls} required /></div>
                                <div className="col-span-2"><label className={labelCls}>Full Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} className={inputCls} required /></div>
                            </div>
                        </div>

                        {/* Pricing & Capacity */}
                        <div className="space-y-6 mb-8 pt-8 border-t border-border-default">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm">3</span>
                                Pricing & Capacity
                            </h3>
                            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
                                <div><label className={labelCls}>Starting Price (₹)</label><input type="number" name="startingPrice" value={formData.startingPrice} onChange={handleChange} className={inputCls} required /></div>
                                <div><label className={labelCls}>Price Per Plate (₹)</label><input type="number" name="pricePerPlate" value={formData.pricePerPlate} onChange={handleChange} className={inputCls} /></div>
                                <div><label className={labelCls}>Min Capacity</label><input type="number" name="capacity.min" value={formData.capacity.min} onChange={handleChange} className={inputCls} required /></div>
                                <div><label className={labelCls}>Max Capacity</label><input type="number" name="capacity.max" value={formData.capacity.max} onChange={handleChange} className={inputCls} required /></div>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="space-y-6 mb-8 pt-8 border-t border-border-default">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm">4</span>
                                Amenities
                            </h3>
                            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
                                {Object.keys(formData.amenities).map(key => {
                                    if (key === 'rooms') return null;
                                    return (
                                        <label key={key} className="flex items-center gap-3 p-4 bg-white/[0.03] border border-border-default rounded-xl cursor-pointer hover:bg-white/[0.06] transition-all">
                                            <input
                                                type="checkbox"
                                                name={`amenities.${key}`}
                                                checked={formData.amenities[key]}
                                                onChange={handleChange}
                                                className="w-5 h-5 accent-primary rounded"
                                            />
                                            <span className="text-white text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        </label>
                                    );
                                })}
                                <div><label className={labelCls}>Number of Rooms</label><input type="number" name="amenities.rooms" value={formData.amenities.rooms} onChange={handleChange} className={inputCls} /></div>
                            </div>
                        </div>

                        {/* Packages */}
                        <div className="space-y-6 mb-8 pt-8 border-t border-border-default">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm">5</span>
                                    Packages & Pricing
                                </h3>
                                <p className="text-text-muted text-xs mt-2 ml-10">Create booking packages for your venue. Each package should have a name, price, and what's included.</p>
                            </div>

                            {/* Example hint */}
                            {formData.packages.length === 0 && (
                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                    <p className="text-primary-light text-xs font-semibold mb-2">💡 Example Package:</p>
                                    <div className="text-text-muted text-xs space-y-1">
                                        <p><span className="text-white">Name:</span> Gold Package</p>
                                        <p><span className="text-white">Price:</span> ₹2,50,000</p>
                                        <p><span className="text-white">Description:</span> Complete wedding package for 300 guests</p>
                                        <p><span className="text-white">Includes:</span> Decoration, Food, DJ, Lighting, Stage</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {formData.packages.map((pkg, index) => (
                                    <div key={index} className="p-5 bg-white/[0.03] border border-border-default rounded-xl space-y-4 relative">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-primary-light uppercase tracking-wider">Package {index + 1}</span>
                                            <button type="button" onClick={() => removePackage(index)} className="flex items-center gap-1 text-text-muted hover:text-red-400 text-xs"><HiTrash /> Remove</button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs text-text-muted mb-1 block">Package Name *</label>
                                                <input type="text" value={pkg.name} onChange={(e) => updatePackage(index, 'name', e.target.value)} placeholder="e.g. Silver, Gold, Premium" className={inputCls} required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-text-muted mb-1 block">Price (₹) *</label>
                                                <input type="number" value={pkg.price} onChange={(e) => updatePackage(index, 'price', e.target.value)} placeholder="e.g. 150000" className={inputCls} required />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted mb-1 block">Short Description</label>
                                            <input type="text" value={pkg.description} onChange={(e) => updatePackage(index, 'description', e.target.value)} placeholder="e.g. Budget friendly package for 200 guests" className={inputCls} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-text-muted mb-1 block">What's Included <span className="text-text-muted/60">(comma separated)</span></label>
                                            <input type="text" value={pkg.includes} onChange={(e) => updatePackage(index, 'includes', e.target.value)} placeholder="e.g. Decoration, Catering, DJ, Stage, Lighting" className={inputCls} />
                                            <p className="text-text-muted/50 text-[10px] mt-1">Separate each item with a comma</p>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addPackage} className="flex items-center gap-2 px-4 py-2.5 text-primary-light text-sm font-medium hover:text-white border border-dashed border-primary/30 rounded-xl hover:border-primary/60 transition-all w-full justify-center">
                                    <HiPlus /> Add Package
                                </button>
                            </div>
                        </div>

                        {/* Food Menu */}
                        <div className="space-y-6 mb-8 pt-8 border-t border-border-default">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm">6</span>
                                    Food Menu
                                </h3>
                                <p className="text-text-muted text-xs mt-2 ml-10">Add your food menu by categories (like Starters, Main Course, Desserts) and add items under each category.</p>
                            </div>

                            {/* Example hint */}
                            {formData.foodMenu.length === 0 && (
                                <div className="p-4 bg-accent-emerald/5 border border-accent-emerald/10 rounded-xl">
                                    <p className="text-accent-emerald text-xs font-semibold mb-2">💡 How it works:</p>
                                    <div className="text-text-muted text-xs space-y-2">
                                        <p><span className="text-white font-medium">Step 1:</span> Click "Add Menu Category" → Enter category name (e.g. <span className="text-white">Starters</span>)</p>
                                        <p><span className="text-white font-medium">Step 2:</span> Click "+ Add Item" under the category → Enter item name (e.g. <span className="text-white">Paneer Tikka</span>), price (<span className="text-white">₹250</span>), and type (Veg/Non-Veg)</p>
                                        <p><span className="text-white font-medium">Step 3:</span> Add more items and categories as needed</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-6">
                                {formData.foodMenu.map((cat, i) => (
                                    <div key={i} className="p-5 bg-white/[0.03] border border-border-default rounded-xl relative">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-xs font-bold text-accent-emerald uppercase tracking-wider">Category {i + 1}</span>
                                            <button type="button" onClick={() => removeMenuCategory(i)} className="flex items-center gap-1 text-text-muted hover:text-red-400 text-xs"><HiTrash /> Remove Category</button>
                                        </div>
                                        <div className="mb-4">
                                            <label className="text-xs text-text-muted mb-1 block">Category Name *</label>
                                            <input type="text" value={cat.category} onChange={(e) => updateMenuCategory(i, e.target.value)} placeholder="e.g. Starters, Main Course, Desserts, Beverages" className={`${inputCls} font-bold`} required />
                                        </div>

                                        <div className="space-y-3 pl-4 border-l-2 border-accent-emerald/20">
                                            <p className="text-text-muted/60 text-[10px] uppercase tracking-wider font-semibold">Menu Items</p>
                                            {cat.items.map((item, j) => (
                                                <div key={j} className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        {j === 0 && <label className="text-[10px] text-text-muted mb-1 block">Item Name</label>}
                                                        <input type="text" value={item.name} onChange={(e) => updateMenuItem(i, j, 'name', e.target.value)} placeholder="e.g. Paneer Tikka" className="w-full px-3 py-2.5 bg-white/5 border border-border-default rounded-lg text-white text-sm outline-none focus:border-accent-emerald transition-all" required />
                                                    </div>
                                                    <div className="w-24">
                                                        {j === 0 && <label className="text-[10px] text-text-muted mb-1 block">Price (₹)</label>}
                                                        <input type="number" value={item.price} onChange={(e) => updateMenuItem(i, j, 'price', e.target.value)} placeholder="250" className="w-full px-3 py-2.5 bg-white/5 border border-border-default rounded-lg text-white text-sm outline-none focus:border-accent-emerald transition-all" />
                                                    </div>
                                                    <div className="w-24">
                                                        {j === 0 && <label className="text-[10px] text-text-muted mb-1 block">Type</label>}
                                                        <select value={item.isVeg} onChange={(e) => updateMenuItem(i, j, 'isVeg', e.target.value === 'true')} className="w-full px-2 py-2.5 bg-white/5 border border-border-default rounded-lg text-white text-xs outline-none focus:border-accent-emerald transition-all">
                                                            <option value="true" className="bg-bg-card">🟢 Veg</option>
                                                            <option value="false" className="bg-bg-card">🔴 Non-Veg</option>
                                                        </select>
                                                    </div>
                                                    <button type="button" onClick={() => removeMenuItem(i, j)} className="p-2 text-text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><HiX /></button>
                                                </div>
                                            ))}
                                            {cat.items.length === 0 && (
                                                <p className="text-text-muted/40 text-xs italic py-2">No items added yet. Click the button below to add menu items.</p>
                                            )}
                                            <button type="button" onClick={() => addMenuItem(i)} className="flex items-center gap-1.5 px-3 py-2 text-xs text-accent-emerald font-medium hover:text-white border border-dashed border-accent-emerald/30 rounded-lg hover:border-accent-emerald/60 transition-all">
                                                <HiPlus className="text-sm" /> Add Item to {cat.category || 'this category'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={addMenuCategory} className="flex items-center gap-2 px-4 py-2.5 text-primary-light text-sm font-medium hover:text-white border border-dashed border-primary/30 rounded-xl hover:border-primary/60 transition-all w-full justify-center">
                                    <HiPlus /> Add Menu Category
                                </button>
                            </div>
                        </div>

                        {/* Images */}
                        <div className="space-y-6 mb-8 pt-8 border-t border-border-default">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-primary/20 text-primary-light flex items-center justify-center text-sm">7</span>
                                Photos
                            </h3>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-border-default rounded-xl cursor-pointer hover:bg-white/10 transition-all text-white text-sm font-medium">
                                        <HiPhotograph className="text-lg" />
                                        <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                    <span className="text-text-muted text-xs">Supported: JPG, PNG, WEBP (Max 5MB)</span>
                                </div>

                                {formData.images.filter(url => url).length > 0 && (
                                    <div className="grid grid-cols-4 max-sm:grid-cols-2 gap-4 mt-4">
                                        {formData.images.filter(url => url).map((url, index) => (
                                            <div key={index} className="relative group aspect-video rounded-xl overflow-hidden border border-border-default bg-black/20">
                                                <img src={url} alt={`Venue ${index + 1}`} className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <HiTrash />
                                                </button>
                                                {index === 0 && <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded uppercase">Cover</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-border-default flex gap-4 justify-end">
                            <Link to="/vendor/dashboard" className="px-6 py-3 rounded-xl border border-border-default text-text-secondary font-medium hover:text-white hover:border-white/20 transition-all">Cancel</Link>
                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className={`px-8 py-3 rounded-xl text-white font-semibold hover:-translate-y-0.5 transition-all disabled:opacity-50 ${isEditMode
                                    ? 'bg-gradient-to-r from-accent-emerald to-teal-500 shadow-[0_4px_15px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)]'
                                    : 'bg-gradient-to-r from-primary to-primary-light shadow-[0_4px_15px_rgba(108,60,225,0.4)] hover:shadow-[0_6px_25px_rgba(108,60,225,0.5)]'
                                    }`}
                            >
                                {loading
                                    ? (isEditMode ? 'Updating Venue...' : 'Listing Venue...')
                                    : (isEditMode ? 'Update Venue' : 'List Venue')
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
