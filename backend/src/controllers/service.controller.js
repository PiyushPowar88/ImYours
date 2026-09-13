const ServiceModel = require('../models/service.model');

exports.getServices = async (req, res, next) => {
  try {
    // Public endpoint: only show active services unless admin explicitly requests all
    const status = req.query.status || (req.user?.role === 'admin' ? undefined : 'active');
    const services = await ServiceModel.findAll({ status });
    res.json({ success: true, services });
  } catch (err) {
    next(err);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await ServiceModel.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.json({ success: true, service });
  } catch (err) {
    next(err);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const { title, hostName, description, duration, price, meetingType, isPopular } = req.body;

    if (!title || !duration || !price) {
      return res.status(400).json({ success: false, message: 'title, duration and price are required' });
    }

    const hostPhoto = req.files?.hostPhoto?.[0] ? `/uploads/${req.files.hostPhoto[0].filename}` : null;

    const id = await ServiceModel.create({
      title, hostName, description, duration, price, hostPhoto, meetingType,
      isPopular: isPopular === 'true' || isPopular === true,
    });
    const service = await ServiceModel.findById(id);

    res.status(201).json({ success: true, message: 'Service created', service });
  } catch (err) {
    next(err);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const existing = await ServiceModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    const fields = { ...req.body };
    if (req.body.hostName !== undefined) {
      fields.host_name = req.body.hostName;
      delete fields.hostName;
    }
    if (req.files?.hostPhoto?.[0]) {
      fields.host_photo = `/uploads/${req.files.hostPhoto[0].filename}`;
    }

    await ServiceModel.update(req.params.id, fields);
    const updated = await ServiceModel.findById(req.params.id);

    res.json({ success: true, message: 'Service updated', service: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const existing = await ServiceModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    await ServiceModel.remove(req.params.id);
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
};