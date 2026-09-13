const FormModel = require('../models/form.model');

// Public: fetch the form schema to render on the booking page
exports.getForm = async (req, res, next) => {
  try {
    const fields = await FormModel.getByService(req.params.serviceId);
    res.json({ success: true, fields });
  } catch (err) {
    next(err);
  }
};

// Admin: add a field
exports.addField = async (req, res, next) => {
  try {
    const { serviceId, fieldName, fieldType, options, placeholder, required, sortOrder } = req.body;

    if (!serviceId || !fieldName || !fieldType) {
      return res.status(400).json({ success: false, message: 'serviceId, fieldName, fieldType are required' });
    }

    const validTypes = ['text', 'number', 'email', 'phone', 'textarea', 'dropdown', 'checkbox', 'radio', 'date', 'file'];
    if (!validTypes.includes(fieldType)) {
      return res.status(400).json({ success: false, message: `fieldType must be one of: ${validTypes.join(', ')}` });
    }

    const id = await FormModel.addField({ serviceId, fieldName, fieldType, options, placeholder, required, sortOrder });
    const field = await FormModel.findById(id);

    res.status(201).json({ success: true, message: 'Field added', field });
  } catch (err) {
    next(err);
  }
};

// Admin: update a field (label, required, options, etc.)
exports.updateField = async (req, res, next) => {
  try {
    const existing = await FormModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }
    await FormModel.update(req.params.id, req.body);
    const updated = await FormModel.findById(req.params.id);
    res.json({ success: true, message: 'Field updated', field: updated });
  } catch (err) {
    next(err);
  }
};

// Admin: reorder fields
exports.reorderFields = async (req, res, next) => {
  try {
    const { serviceId, orderedIds } = req.body;
    if (!serviceId || !Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'serviceId and orderedIds[] are required' });
    }
    await FormModel.reorder(serviceId, orderedIds);
    const fields = await FormModel.getByService(serviceId);
    res.json({ success: true, message: 'Fields reordered', fields });
  } catch (err) {
    next(err);
  }
};

// Admin: delete a field
exports.deleteField = async (req, res, next) => {
  try {
    const existing = await FormModel.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }
    await FormModel.remove(req.params.id);
    res.json({ success: true, message: 'Field deleted' });
  } catch (err) {
    next(err);
  }
};