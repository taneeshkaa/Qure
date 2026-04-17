
// Phase 1 Doctor Dashboard functions
exports.getProfile = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { doctorProfile: { include: { hospital: true } } }
  });
  if (!user || !user.doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });
  res.json({
    name: user.name,
    specialization: user.doctorProfile.specialization,
    experience: user.doctorProfile.experience,
    consultationFee: user.doctorProfile.consultation_fee,
    isAvailable: user.doctorProfile.isAvailable,
    hospital: {
      id: user.doctorProfile.hospital.id,
      name: user.doctorProfile.hospital.hospital_name
    }
  });
};

exports.getQueue = async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { doctorProfile: true }});
  if (!user || !user.doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const queue = await prisma.queueEntry.findMany({
    where: { doctorId: user.doctorProfile.id, date: { gte: today, lt: tomorrow } },
    include: { patient: true }
  });
  res.json(queue.map(q => ({ id: q.id, token: q.token, status: q.status, patientName: q.patient.name })));
};

exports.updateQueueEntry = async (req, res, next) => {
  const { id } = req.params;
  const { action } = req.body;
  let status = 'WAITING';
  if (action == 'CALL_NEXT') status = 'IN_PROGRESS';
  else if (action == 'SKIP') status = 'SKIPPED';
  else if (action == 'COMPLETE') status = 'COMPLETED';
  const updated = await prisma.queueEntry.update({ where: { id: parseInt(id) }, data: { status } });
  try { const socketIo = require('../../server').io; if (socketIo) socketIo.emit('queue:updated', { queueEntryId: parseInt(id), status }); } catch(e){}
  res.json(updated);
};

exports.writePrescription = async (req, res, next) => {
  const { patientId, medicines, notes } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { doctorProfile: true }});
  if (!user || !user.doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });
  const newp = await prisma.prescription_Phase1.create({ data: { doctorId: user.doctorProfile.id, patientId, medicines, notes } });
  try { const socketIo = require('../../server').io; if (socketIo) socketIo.emit('prescription:new', { patientId, doctorName: user.name, medicines, notes }); } catch(e){}
  res.status(201).json(newp);
};

exports.toggleAvailability = async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id }, include: { doctorProfile: true }});
  if (!user || !user.doctorProfile) return res.status(404).json({ message: 'Doctor profile not found' });
  const updated = await prisma.doctor.update({ where: { id: user.doctorProfile.id }, data: { isAvailable: not user.doctorProfile.isAvailable } });
  res.json({ isAvailable: updated.isAvailable });
};
