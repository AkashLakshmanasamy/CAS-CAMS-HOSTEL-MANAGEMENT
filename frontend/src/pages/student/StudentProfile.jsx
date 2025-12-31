// src/pages/StudentProfile.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/supabase"; 
import { useAuth } from "../../context/AuthContext"; // ✅ Using your AuthContext
import "../../styles/StudentProfile.css";

// --- Icons (Same as before) ---
const Icon = ({ path, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`icon ${className}`}>
    <path fillRule="evenodd" d={path} clipRule="evenodd" />
  </svg>
);

const ICONS = {
  user: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z",
  contact: "M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z",
  family: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z",
  academic: "M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z",
  upload: "M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z",
  save: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
  image: "M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
};

// --- Dropdown Constants ---
const FLOORS = ["Ground", "First", "Second", "Third", "Dining First", "Dining Second"];
const DEPARTMENTS = [ "Computer Science and Design", "Computer Science", "Information Technology", "Mechanical Engineering", "Civil Engineering", "Electronics and Communication", "Electrical Engineering", "Automobile Engineering", "Food Technology" ];
const YEARS = ["I", "II", "III", "IV"];
const SECTIONS = ["A", "B", "C", "D"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ADMISSION_MODES = ["Regular", "Lateral"];
const FEE_MODES = ["Online", "Cash", "Cheque"];

export default function StudentProfile() {
  const { user, loading } = useAuth(); // ✅ Use AuthContext to get the user

  const [form, setForm] = useState({
    floor: "", roomNo: "", department: "", rollNo: "", name: "", year: "", section: "",
    mobile: "", whatsapp: "", email: "", bloodGroup: "", fatherName: "", fatherContact: "",
    fatherOccupation: "", motherName: "", motherContact: "", motherOccupation: "",
    dob: "", address: "", district: "", admissionMode: "", feeMode: "",
  });

  // State for files and previews
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [idCardPhoto, setIdCardPhoto] = useState(null);
  const [feesReceipt, setFeesReceipt] = useState(null);
  const [passportPreview, setPassportPreview] = useState("");
  const [idCardPreview, setIdCardPreview] = useState("");
  const [feesPreview, setFeesPreview] = useState("");

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // 1. Fetch Existing Data when User Loads
  useEffect(() => {
    if (loading || !user) return; // Wait for AuthContext to be ready

    // ✅ Set email from context immediately
    setForm(prev => ({ ...prev, email: user.email })); 

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error; // Ignore not found errors

        if (data) {
          setForm({
            floor: data.floor || "", roomNo: data.room_no || "", department: data.department || "",
            rollNo: data.roll_no || "", name: data.name || "", year: data.year || "", section: data.section || "",
            mobile: data.mobile || "", whatsapp: data.whatsapp || "", 
            email: data.email || user.email, // Use DB email or Fallback to Auth email
            bloodGroup: data.blood_group || "", fatherName: data.father_name || "", fatherContact: data.father_contact || "",
            fatherOccupation: data.father_occupation || "", motherName: data.mother_name || "", motherContact: data.mother_contact || "",
            motherOccupation: data.mother_occupation || "", dob: data.dob || "", address: data.address || "",
            district: data.district || "", admissionMode: data.admission_mode || "", feeMode: data.fee_mode || "",
          });
          
          if (data.passport_photo_url) setPassportPreview(data.passport_photo_url);
          if (data.id_card_photo_url) setIdCardPreview(data.id_card_photo_url);
          if (data.fees_receipt_url) setFeesPreview(data.fees_receipt_url);
        }
      } catch (err) {
        console.error("Error fetching profile:", err.message);
      }
    };

    fetchProfile();
  }, [user, loading]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (setter, setPreview) => (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
      setErrorMessage("File size must be under 10MB"); 
      return; 
    }
    
    setter(file);
    const reader = new FileReader();
    reader.onload = () => { setPreview(reader.result); };
    reader.readAsDataURL(file);
    setErrorMessage(""); 
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = [
      "floor", "roomNo", "department", "rollNo", "name", "year", "section",
      "mobile", "whatsapp", "bloodGroup", "fatherName", "fatherContact",
      "motherName", "motherContact", "dob", "address", "district",
      "admissionMode", "feeMode"
    ];

    requiredFields.forEach(f => { if (!form[f]?.toString().trim()) newErrors[f] = "Required"; });
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) newErrors.mobile = "Invalid No.";
    if (form.whatsapp && !/^\d{10}$/.test(form.whatsapp)) newErrors.whatsapp = "Invalid No.";
    
    if (!passportPhoto && !passportPreview) newErrors.passportPhoto = "Required";
    if (!idCardPhoto && !idCardPreview) newErrors.idCardPhoto = "Required";
    if (!feesReceipt && !feesPreview) newErrors.feesReceipt = "Required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file, folderName) => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${folderName}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('student-files')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('student-files').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) { 
      setErrorMessage("Please fill out all required fields."); 
      return; 
    }

    if (!user) {
      setErrorMessage("You must be logged in to save.");
      return;
    }

    setIsSubmitting(true);

    try {
      let passportUrl = passportPreview;
      let idCardUrl = idCardPreview;
      let feesUrl = feesPreview;

      if (passportPhoto) passportUrl = await uploadFile(passportPhoto, 'passport');
      if (idCardPhoto) idCardUrl = await uploadFile(idCardPhoto, 'id_card');
      if (feesReceipt) feesUrl = await uploadFile(feesReceipt, 'fees');

      const profileData = {
        user_id: user.id, // Linked to AuthContext User
        name: form.name,
        roll_no: form.rollNo,
        dob: form.dob,
        blood_group: form.bloodGroup,
        email: user.email, // ✅ Ensuring email matches Auth
        department: form.department,
        year: form.year,
        section: form.section,
        admission_mode: form.admissionMode,
        mobile: form.mobile,
        whatsapp: form.whatsapp,
        father_name: form.fatherName,
        father_contact: form.fatherContact,
        father_occupation: form.fatherOccupation,
        mother_name: form.motherName,
        mother_contact: form.motherContact,
        mother_occupation: form.motherOccupation,
        address: form.address,
        district: form.district,
        floor: form.floor,
        room_no: form.roomNo,
        fee_mode: form.feeMode,
        passport_photo_url: passportUrl,
        id_card_photo_url: idCardUrl,
        fees_receipt_url: feesUrl,
      };

      const { error } = await supabase
        .from('student_profiles')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) throw error;
      setSuccessMessage("Profile saved successfully!");
      
    } catch (error) {
      console.error("Submission Error:", error);
      setErrorMessage(error.message || "Failed to save profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Add a Loading State
  if (loading) {
    return <div className="loading-container">Loading profile...</div>; 
  }

  // If page loads but no user is found (handled by ProtectedRoute usually, but safe to have here)
  if (!user) {
    return <div className="loading-container">Please log in.</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Student Profile</h2>
          <p>Please complete all required fields to finalize your registration.</p>
        </div>

        {successMessage && <div className="alert success">{successMessage}</div>}
        {errorMessage && <div className="alert error">{errorMessage}</div>}

        <form className="profile-form" onSubmit={handleSubmit}>
          
          <div className="form-section-title">
            <Icon path={ICONS.user} className="section-icon" /> Personal Information
          </div>
          <div className="form-grid">
             <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input type="text" id="name" name="name" value={form.name} onChange={onChange} className={errors.name ? 'error' : ''} />
              {errors.name && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="rollNo">Roll Number *</label>
              <input type="text" id="rollNo" name="rollNo" value={form.rollNo} onChange={onChange} className={errors.rollNo ? 'error' : ''} />
              {errors.rollNo && <span className="error-text">{errors.rollNo}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="dob">Date of Birth *</label>
              <input type="date" id="dob" name="dob" value={form.dob} onChange={onChange} className={errors.dob ? 'error' : ''} />
              {errors.dob && <span className="error-text">{errors.dob}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="bloodGroup">Blood Group *</label>
              <select id="bloodGroup" name="bloodGroup" value={form.bloodGroup} onChange={onChange} className={errors.bloodGroup ? 'error' : ''}>
                <option value="">Select Group</option>
                {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
              </select>
              {errors.bloodGroup && <span className="error-text">{errors.bloodGroup}</span>}
            </div>

            {/* ✅ LOCKED EMAIL FIELD using Context User */}
            <div className="form-group full-width">
              <label htmlFor="email">Email Address (Locked)</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={form.email} 
                readOnly 
                disabled 
                className="read-only-input"
                style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed", opacity: 0.7 }}
              />
            </div>
          </div>

          <div className="form-divider"></div>
          {/* ... Remainder of the form (Academic, Contact, Hostel, Uploads) ... */}
          {/* (Copy the rest of the form JSX from the previous message here, it remains identical) */}
          
          <div className="form-section-title">
            <Icon path={ICONS.academic} className="section-icon" /> Academic Details
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <select id="department" name="department" value={form.department} onChange={onChange} className={errors.department ? 'error' : ''}>
                <option value="">Select Department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="error-text">{errors.department}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="year">Year *</label>
              <select id="year" name="year" value={form.year} onChange={onChange} className={errors.year ? 'error' : ''}>
                <option value="">Select Year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              {errors.year && <span className="error-text">{errors.year}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="section">Section *</label>
              <select id="section" name="section" value={form.section} onChange={onChange} className={errors.section ? 'error' : ''}>
                <option value="">Select Section</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.section && <span className="error-text">{errors.section}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="admissionMode">Admission Mode *</label>
              <select id="admissionMode" name="admissionMode" value={form.admissionMode} onChange={onChange} className={errors.admissionMode ? 'error' : ''}>
                <option value="">Select Mode</option>
                {ADMISSION_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.admissionMode && <span className="error-text">{errors.admissionMode}</span>}
            </div>
          </div>

          <div className="form-divider"></div>
          <div className="form-section-title">
            <Icon path={ICONS.contact} className="section-icon" /> Contact & Parent Info
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="mobile">Student Mobile *</label>
              <input type="tel" id="mobile" name="mobile" value={form.mobile} onChange={onChange} className={errors.mobile ? 'error' : ''} />
              {errors.mobile && <span className="error-text">{errors.mobile}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp *</label>
              <input type="tel" id="whatsapp" name="whatsapp" value={form.whatsapp} onChange={onChange} className={errors.whatsapp ? 'error' : ''} />
              {errors.whatsapp && <span className="error-text">{errors.whatsapp}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="fatherName">Father's Name *</label>
              <input type="text" id="fatherName" name="fatherName" value={form.fatherName} onChange={onChange} className={errors.fatherName ? 'error' : ''} />
              {errors.fatherName && <span className="error-text">{errors.fatherName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="fatherContact">Father's Contact *</label>
              <input type="tel" id="fatherContact" name="fatherContact" value={form.fatherContact} onChange={onChange} className={errors.fatherContact ? 'error' : ''} />
              {errors.fatherContact && <span className="error-text">{errors.fatherContact}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="motherName">Mother's Name *</label>
              <input type="text" id="motherName" name="motherName" value={form.motherName} onChange={onChange} className={errors.motherName ? 'error' : ''} />
              {errors.motherName && <span className="error-text">{errors.motherName}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="motherContact">Mother's Contact *</label>
              <input type="tel" id="motherContact" name="motherContact" value={form.motherContact} onChange={onChange} className={errors.motherContact ? 'error' : ''} />
              {errors.motherContact && <span className="error-text">{errors.motherContact}</span>}
            </div>
          </div>
          
          <div className="form-group full-width" style={{ marginTop: "1rem" }}>
            <label htmlFor="address">Permanent Address *</label>
            <textarea id="address" name="address" value={form.address} onChange={onChange} rows="3" className={errors.address ? 'error' : ''}></textarea>
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>
          <div className="form-grid">
             <div className="form-group">
              <label htmlFor="district">District *</label>
              <input type="text" id="district" name="district" value={form.district} onChange={onChange} className={errors.district ? 'error' : ''} />
              {errors.district && <span className="error-text">{errors.district}</span>}
            </div>
          </div>

          <div className="form-divider"></div>
          <div className="form-section-title">
            <Icon path={ICONS.family} className="section-icon" /> Hostel Details
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="floor">Floor *</label>
              <select id="floor" name="floor" value={form.floor} onChange={onChange} className={errors.floor ? 'error' : ''}>
                <option value="">Select Floor</option>
                {FLOORS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              {errors.floor && <span className="error-text">{errors.floor}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="roomNo">Room Number *</label>
              <input type="text" id="roomNo" name="roomNo" value={form.roomNo} onChange={onChange} className={errors.roomNo ? 'error' : ''} />
              {errors.roomNo && <span className="error-text">{errors.roomNo}</span>}
            </div>
             <div className="form-group">
              <label htmlFor="feeMode">Fee Payment Mode *</label>
              <select id="feeMode" name="feeMode" value={form.feeMode} onChange={onChange} className={errors.feeMode ? 'error' : ''}>
                <option value="">Select Mode</option>
                {FEE_MODES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              {errors.feeMode && <span className="error-text">{errors.feeMode}</span>}
            </div>
          </div>

          <div className="form-divider"></div>
          <div className="form-section-title">
            <Icon path={ICONS.image} className="section-icon" /> Documents Upload
          </div>
          
          <div className="upload-grid">
            <div className="upload-card">
              <label>Passport Photo *</label>
              <div className="upload-area">
                {passportPreview ? (
                  <img src={passportPreview} alt="Preview" className="img-preview" />
                ) : (
                  <div className="placeholder"><Icon path={ICONS.image} /></div>
                )}
                <input type="file" onChange={handleFileChange(setPassportPhoto, setPassportPreview)} accept="image/*" className="file-input" />
              </div>
              {errors.passportPhoto && <span className="error-text-center">{errors.passportPhoto}</span>}
            </div>

            <div className="upload-card">
              <label>ID Card *</label>
              <div className="upload-area">
                {idCardPreview ? (
                  idCardPreview.endsWith('.pdf') ? <div className="pdf-preview">PDF Selected</div> : <img src={idCardPreview} alt="Preview" className="img-preview" />
                ) : (
                  <div className="placeholder"><Icon path={ICONS.image} /></div>
                )}
                <input type="file" onChange={handleFileChange(setIdCardPhoto, setIdCardPreview)} accept="image/*,application/pdf" className="file-input" />
              </div>
              {errors.idCardPhoto && <span className="error-text-center">{errors.idCardPhoto}</span>}
            </div>

            <div className="upload-card">
              <label>Fees Receipt *</label>
              <div className="upload-area">
                {feesPreview ? (
                  feesPreview.endsWith('.pdf') ? <div className="pdf-preview">PDF Selected</div> : <img src={feesPreview} alt="Preview" className="img-preview" />
                ) : (
                  <div className="placeholder"><Icon path={ICONS.image} /></div>
                )}
                <input type="file" onChange={handleFileChange(setFeesReceipt, setFeesPreview)} accept="image/*,application/pdf" className="file-input" />
              </div>
              {errors.feesReceipt && <span className="error-text-center">{errors.feesReceipt}</span>}
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner"></span> Saving...
              </>
            ) : (
              <>
                Save Profile
                <Icon path={ICONS.save} />
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}