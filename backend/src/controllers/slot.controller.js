const SlotModel = require('../models/slot.model');

exports.getSlots = async (req, res, next) => {
  try {
    const { serviceId, date } = req.query;
    if (!serviceId) {
      return res.status(400).json({ success: false, message: 'serviceId is required' });
    }
    const slots = await SlotModel.findByService(serviceId, { date, upcoming: !date });
    res.json({ success: true, slots });
  } catch (err) {
    next(err);
  }
};

exports.createSlot = async (req, res, next) => {
  try {
    const { serviceId, date, startTime, endTime, maxBookings } = req.body;
    if (!serviceId || !date || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'serviceId, date, startTime, endTime are required' });
    }

    const id = await SlotModel.create({ serviceId, date, startTime, endTime, maxBookings });
    const slot = await SlotModel.findById(id);

    res.status(201).json({ success: true, message: 'Slot created', slot });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Slot already exists for this time' });
    }
    next(err);
  }
};

// Bulk create slots, e.g. generate every weekday 9am-5pm hourly for a date range
exports.bulkCreateSlots = async (req, res, next) => {
  try {
    const { serviceId, dates, times, maxBookings } = req.body;
    // dates: ["2026-08-01", "2026-08-02"], times: [{start:"09:00",end:"10:00"}, ...]
    if (!serviceId || !Array.isArray(dates) || !Array.isArray(times)) {
      return res.status(400).json({ success: false, message: 'serviceId, dates[], times[] are required' });
    }

    const slotsArray = [];
    for (const date of dates) {
      for (const t of times) {
        slotsArray.push({
          serviceId, date, startTime: t.start, endTime: t.end, maxBookings,
        });
      }
    }

    await SlotModel.bulkCreate(slotsArray);
    res.status(201).json({ success: true, message: `${slotsArray.length} slots processed` });
  } catch (err) {
    next(err);
  }
};

exports.updateSlot = async (req, res, next) => {
  try {
    const existing = await SlotModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    await SlotModel.update(req.params.id, req.body);
    const updated = await SlotModel.findById(req.params.id);
    res.json({ success: true, message: 'Slot updated', slot: updated });
  } catch (err) {
    next(err);
  }
};


exports.getAllSlotsAdmin = async (req, res, next) => {
  try {
    const { serviceId } = req.query;
    if (!serviceId) {
      return res.status(400).json({ success: false, message: 'serviceId is required' });
    }
    const slots = await SlotModel.findAllByServiceAdmin(serviceId);
    res.json({ success: true, slots });
  } catch (err) {
    next(err);
  }
};

exports.deleteSlot = async (req, res, next) => {
  try {
    const existing = await SlotModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Slot not found' });
    }
    await SlotModel.remove(req.params.id);
    res.json({ success: true, message: 'Slot deleted' });
  } catch (err) {
    next(err);
  }
};