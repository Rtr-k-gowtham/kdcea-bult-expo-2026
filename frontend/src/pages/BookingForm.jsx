import React, { useState, useEffect } from 'react';
import { getHalls, getCategories, getStalls, createBooking } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './BookingForm.css';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const steps = ['Company Details', 'Stall Selection'];

const BookingForm = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [categories, setCategories] = useState([]);
  const [halls, setHalls] = useState([]);
  const [stalls, setStalls] = useState([]);

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    mobile: '',
    email: '',
    address: '',
    category_id: '',
    hall_id: '',
    stall_id: '',
    product_description: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fullscreenMap, setFullscreenMap] = useState(null);

  useEffect(() => {
    getCategories().then(res => setCategories(res.data?.data || [])).catch(err => console.error(err));
    getHalls().then(res => setHalls(res.data?.data || [])).catch(err => console.error(err));
  }, []);

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    const selectedCat = (categories || []).find(c => c.id == catId);
    
    setFormData(prev => ({
      ...prev,
      category_id: catId,
      hall_id: selectedCat ? selectedCat.hall_id : '',
      stall_id: ''
    }));

    if (selectedCat) {
      getStalls(selectedCat.hall_id).then(res => setStalls(res.data?.data || [])).catch(err => console.error(err));
    } else {
      setStalls([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.company_name || !formData.contact_person || !formData.mobile || !formData.email || !formData.address) {
        setError("Please fill all required fields in this step.");
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.category_id || !formData.stall_id || !formData.product_description) {
        setError("Please select a category, stall, and provide a product description.");
        return;
      }
    }
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const res = await createBooking(data);
      if (res.data.status === 'success') {
        setSuccess(true);
        setActiveStep(2); // Success Screen
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while submitting.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <div className="form-grid">
            <div className="input-group">
                <label className="input-label">Company Name *</label>
                <input type="text" className="custom-input" name="company_name" value={formData.company_name} onChange={handleInputChange} placeholder="Enter your company name" />
            </div>
            <div className="input-group">
                <label className="input-label">Contact Person *</label>
                <input type="text" className="custom-input" name="contact_person" value={formData.contact_person} onChange={handleInputChange} placeholder="Full name of contact person" />
            </div>
            <div className="input-group">
                <label className="input-label">Mobile Number *</label>
                <input type="text" className="custom-input" name="mobile" value={formData.mobile} onChange={handleInputChange} placeholder="E.g. +91 9876543210" />
            </div>
            <div className="input-group">
                <label className="input-label">Email Address *</label>
                <input type="email" className="custom-input" name="email" value={formData.email} onChange={handleInputChange} placeholder="company@example.com" />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Company Address *</label>
                <textarea className="custom-input" name="address" value={formData.address} onChange={handleInputChange} placeholder="Full postal address..."></textarea>
            </div>
          </div>
        );
      case 1:
        const selectedHallName = halls.find(h => h.id == formData.hall_id)?.hall_name;
        return (
          <div className="form-grid">
            <div className="input-group">
                <label className="input-label">Business Category *</label>
                <select className="custom-input" name="category_id" value={formData.category_id} onChange={handleCategoryChange}>
                    <option value="" disabled>Select a category</option>
                    {(categories || []).map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                    ))}
                </select>
            </div>
            <div className="input-group">
                <label className="input-label">Assigned Hall</label>
                <input type="text" className="custom-input" value={selectedHallName || 'Select a category first'} disabled />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Available Stalls *</label>
                <select className="custom-input" name="stall_id" value={formData.stall_id} onChange={handleInputChange} disabled={!formData.hall_id}>
                    <option value="" disabled>Select a stall</option>
                    {(stalls || []).length === 0 && formData.hall_id ? (
                        <option disabled value="none">No stalls available in this hall</option>
                    ) : (
                        (stalls || []).map((stall) => (
                        <option key={stall.id} value={stall.id}>
                            Stall {stall.stall_no} &nbsp;|&nbsp; Size: {stall.stall_size || 'N/A'} &nbsp;|&nbsp; Tariff: ₹{stall.tariff_amount ? parseFloat(stall.tariff_amount).toLocaleString('en-IN') : 'N/A'}
                        </option>
                        ))
                    )}
                </select>
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Product / Service Description *</label>
                <textarea className="custom-input" name="product_description" value={formData.product_description} onChange={handleInputChange} placeholder="Briefly describe what you will display..."></textarea>
            </div>

            {formData.hall_id && selectedHallName && (
                <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Hall Layout & Maps</h3>
                    <div style={{ display: 'flex', gap: '30px', flexDirection: 'column' }}>
                        
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>Full Exhibition Map</p>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Scroll or pinch to zoom, drag to pan around.</p>
                                </div>
                                <button type="button" onClick={(e) => { e.preventDefault(); setFullscreenMap("/hall/full hall.jpg"); }} style={{ background: '#003399', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>View Fullscreen</button>
                            </div>
                            <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f1f5f9', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TransformWrapper initialScale={1} minScale={0.5} maxScale={5}>
                                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                                        <img src="/hall/full hall.jpg" alt="Full Hall Map" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    </TransformComponent>
                                </TransformWrapper>
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                <div>
                                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>{selectedHallName} Detailed Layout</p>
                                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>View specific stall numbers and locations.</p>
                                </div>
                                <button type="button" onClick={(e) => { e.preventDefault(); setFullscreenMap(`/hall/${selectedHallName.toLowerCase()}.png`); }} style={{ background: '#003399', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>View Fullscreen</button>
                            </div>
                            <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#f1f5f9', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TransformWrapper initialScale={1} minScale={0.5} maxScale={5}>
                                    <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                                        <img src={`/hall/${selectedHallName.toLowerCase()}.png`} alt={`${selectedHallName} Map`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                    </TransformComponent>
                                </TransformWrapper>
                            </div>
                        </div>

                    </div>
                </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="booking-form-container">
        {/* Left Side Branding */}
        <div className="left-panel">
            <div style={{ marginBottom: '50px' }}>
                <h1 style={{ fontSize: '42px', fontWeight: '900', margin: '0 0 10px 0', letterSpacing: '-1px' }}>Karur Build Expo 2026</h1>
                <h3 style={{ fontSize: '20px', fontWeight: '400', margin: '0', color: 'rgba(255,255,255,0.8)' }}>Premium Stall Booking Portal</h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '32px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Register Details</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Provide your core business information.</p>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Select Stall</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>Choose from available premium stalls.</p>
                </div>
            </div>
        </div>

        {/* Right Side Form */}
        <div className="right-panel">
            <div className="form-card">
                {activeStep === steps.length ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{ fontSize: '80px', color: '#10b981', marginBottom: '20px' }}>✓</div>
                        <h2 style={{ fontSize: '32px', color: '#0f172a', marginBottom: '20px', fontWeight: '800' }}>Application Submitted!</h2>
                        <p style={{ color: '#64748b', lineHeight: '1.6', marginBottom: '40px', fontSize: '16px' }}>
                            Thank you for applying to Karur Build Expo 2026. Our team will review your application and send the official Booking Slip to your registered email upon approval.
                        </p>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>Book Another Stall</button>
                    </div>
                ) : (
                    <>
                        <h2 className="step-title">{steps[activeStep]}</h2>
                        
                        {/* Custom Simple Stepper */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                            {steps.map((label, idx) => (
                                <div key={label} style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: idx <= activeStep ? '#003399' : '#e2e8f0', transition: 'all 0.3s' }}></div>
                            ))}
                        </div>

                        {error && <div style={{ backgroundColor: '#fef2f2', color: '#ef4444', padding: '12px 16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 'bold', border: '1px solid #fecaca' }}>{error}</div>}

                        {renderStepContent(activeStep)}

                        <div className="form-actions">
                            <button className="btn btn-outline" disabled={activeStep === 0} onClick={handleBack}>Back</button>
                            
                            {activeStep === steps.length - 1 ? (
                                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                            ) : (
                                <button className="btn btn-primary" onClick={handleNext}>Continue</button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
        {/* Fullscreen Modal Overlay */}
        {fullscreenMap && (
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '15px 30px', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <button 
                        onClick={() => setFullscreenMap(null)}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background 0.2s' }}
                    >
                        Close Fullscreen
                    </button>
                </div>
                <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <TransformWrapper initialScale={1} minScale={0.5} maxScale={10}>
                        <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                            <img src={fullscreenMap} alt="Fullscreen Map" style={{ maxWidth: '100vw', maxHeight: 'calc(100vh - 100px)', objectFit: 'contain' }} />
                        </TransformComponent>
                    </TransformWrapper>
                </div>
            </div>
        )}
    </div>
  );
};

export default BookingForm;
