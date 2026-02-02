const express = require('express');
const router = express.Router();
const multer = require('multer');
const supabase = require('../utils/supabaseClient'); 
const upload = multer({ storage: multer.memoryStorage() });

// Matches: GET http://localhost:5000/api/student/profile/:userId
router.get('/profile/:userId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('student_profiles')
      .select('*')
      .eq('user_id', req.params.userId)
      .single();
    
    // PGRST116 means "no rows found", which is fine for a new profile
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || {}); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Matches: POST http://localhost:5000/api/student/update
router.post('/update', upload.fields([
  { name: 'passportPhoto', maxCount: 1 },
  { name: 'idCardPhoto', maxCount: 1 },
  { name: 'feesReceipt', maxCount: 1 }
]), async (req, res) => {
  try {
    const { userId, ...profile } = req.body;
    const files = req.files;
    let urls = {};

    const uploadToSupabase = async (file, folder) => {
      const fileName = `${userId}-${Date.now()}-${file.originalname}`;
      const { data, error } = await supabase.storage
        .from('student-files')
        .upload(`${folder}/${fileName}`, file.buffer, { contentType: file.mimetype });
      if (error) throw error;
      return supabase.storage.from('student-files').getPublicUrl(`${folder}/${fileName}`).data.publicUrl;
    };

    if (files.passportPhoto) urls.passport_photo_url = await uploadToSupabase(files.passportPhoto[0], 'passport');
    if (files.idCardPhoto) urls.id_card_photo_url = await uploadToSupabase(files.idCardPhoto[0], 'id_card');
    if (files.feesReceipt) urls.fees_receipt_url = await uploadToSupabase(files.feesReceipt[0], 'fees');

    const { error } = await supabase
      .from('student_profiles')
      .upsert({
        user_id: userId,
        name: profile.name,
        roll_no: profile.rollNo,
        dob: profile.dob,
        blood_group: profile.bloodGroup,
        department: profile.department,
        year: profile.year,
        section: profile.section,
        admission_mode: profile.admissionMode,
        mobile: profile.mobile,
        whatsapp: profile.whatsapp,
        father_name: profile.fatherName,
        father_contact: profile.fatherContact,
        mother_name: profile.motherName,
        mother_contact: profile.motherContact,
        address: profile.address,
        district: profile.district,
        floor: profile.floor,
        room_no: profile.roomNo,
        fee_mode: profile.feeMode,
        ...urls
      }, { onConflict: 'user_id' });

    if (error) throw error;
    res.json({ success: true, message: "Profile Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;