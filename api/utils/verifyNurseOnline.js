async function verifyNurseOnline(nurseId, NurseModel) {
  const Nurse = NurseModel || require('../models/Nurse');
  if (!nurseId) return false;
  const nurse = await Nurse.findOne({
    nurse_id: nurseId,
    is_online: true,
    current_status: 'available'
  });
  return !!nurse;
}

module.exports = verifyNurseOnline;
