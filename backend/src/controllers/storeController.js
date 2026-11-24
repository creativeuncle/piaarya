const BUSINESS_TYPES = require('../constants/businessTypes');

function toPublicGeneral(store) {
  return {
    storeName: store.name,
    owner: {
      name: store.owner?.name || '',
      email: store.owner?.email || '',
      phone: store.owner?.phone || '',
      dateOfBirth: store.owner?.dateOfBirth ? store.owner.dateOfBirth.toISOString().slice(0, 10) : '',
      nationality: store.owner?.nationality || '',
      businessType: store.owner?.businessType || '',
      address: {
        line: store.owner?.address?.line || '',
        city: store.owner?.address?.city || '',
        state: store.owner?.address?.state || '',
        pincode: store.owner?.address?.pincode || '',
      },
    },
    business: {
      legalName: store.business?.legalName || '',
      phone: store.business?.phone || '',
      address: {
        line: store.business?.address?.line || '',
        apartment: store.business?.address?.apartment || '',
        city: store.business?.address?.city || '',
        state: store.business?.address?.state || '',
        pincode: store.business?.address?.pincode || '',
      },
    },
    businessTypes: BUSINESS_TYPES,
  };
}

async function getGeneral(req, res) {
  res.json(toPublicGeneral(req.store));
}

async function updateGeneral(req, res, next) {
  try {
    const { owner, business } = req.body || {};
    const store = req.store;

    if (owner) {
      if (owner.name !== undefined) store.owner.name = owner.name;
      if (owner.email !== undefined) store.owner.email = owner.email;
      if (owner.phone !== undefined) store.owner.phone = owner.phone;
      if (owner.dateOfBirth !== undefined) store.owner.dateOfBirth = owner.dateOfBirth || undefined;
      if (owner.nationality !== undefined) store.owner.nationality = owner.nationality;
      if (owner.businessType !== undefined) store.owner.businessType = owner.businessType;
      if (owner.address) {
        store.owner.address = {
          line: owner.address.line ?? store.owner.address?.line ?? '',
          city: owner.address.city ?? store.owner.address?.city ?? '',
          state: owner.address.state ?? store.owner.address?.state ?? '',
          pincode: owner.address.pincode ?? store.owner.address?.pincode ?? '',
        };
      }
    }

    if (business) {
      store.business = store.business || {};
      if (business.legalName !== undefined) store.business.legalName = business.legalName;
      if (business.phone !== undefined) store.business.phone = business.phone;
      if (business.address) {
        store.business.address = {
          line: business.address.line ?? store.business.address?.line ?? '',
          apartment: business.address.apartment ?? store.business.address?.apartment ?? '',
          city: business.address.city ?? store.business.address?.city ?? '',
          state: business.address.state ?? store.business.address?.state ?? '',
          pincode: business.address.pincode ?? store.business.address?.pincode ?? '',
        };
      }
    }

    await store.save();
    res.json(toPublicGeneral(store));
  } catch (err) {
    next(err);
  }
}

module.exports = { getGeneral, updateGeneral };
