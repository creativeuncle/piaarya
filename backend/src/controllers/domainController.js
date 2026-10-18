const Domain = require('../models/Domain');
const { verifyDomainDns, TARGET_SERVER_IP } = require('../services/dnsVerifier');

const DOMAIN_REGEX = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
const CENTRAL_DOMAIN = (process.env.CENTRAL_DOMAIN || '').toLowerCase().trim();

function toPublicDomain(doc) {
  return {
    id: doc._id,
    domain: doc.domain,
    isPrimary: doc.isPrimary,
    verificationStatus: doc.verificationStatus,
    sslStatus: doc.sslStatus,
    verifiedAt: doc.verifiedAt,
    createdAt: doc.createdAt,
  };
}

// Apex/root domains (example.com) can't use a CNAME per the DNS spec —
// only a subdomain (shop.example.com) can.
function dnsInstructionsFor(domain) {
  const isApex = domain.split('.').length === 2;
  return {
    recordType: isApex ? 'ALIAS or ANAME (A if unavailable)' : 'CNAME',
    host: isApex ? '@' : domain.split('.')[0],
    target: TARGET_SERVER_IP || 'your-server-ip-not-configured',
    note: isApex
      ? "Apex/root domains can't use a CNAME record — use your DNS provider's ALIAS/ANAME record type if it has one, otherwise point an A record at the IP above."
      : `Create a CNAME record pointing ${domain} at the target above.`,
  };
}

async function listDomains(req, res, next) {
  try {
    const domains = await Domain.find().sort({ createdAt: -1 });
    res.json(domains.map(toPublicDomain));
  } catch (err) {
    next(err);
  }
}

async function addDomain(req, res, next) {
  try {
    const clean = (req.body.domain || '').toLowerCase().trim();

    if (!DOMAIN_REGEX.test(clean)) {
      return res.status(400).json({ message: 'Enter a valid domain, e.g. shop.example.com' });
    }
    if (CENTRAL_DOMAIN && (clean === CENTRAL_DOMAIN || clean.endsWith(`.${CENTRAL_DOMAIN}`))) {
      return res.status(400).json({ message: `${CENTRAL_DOMAIN} and its subdomains are reserved` });
    }

    const existing = await Domain.findOne({ domain: clean });
    if (existing) {
      return res.status(409).json({ message: 'This domain is already connected to a store' });
    }

    const created = await Domain.create({ domain: clean });
    res.status(201).json({ domain: toPublicDomain(created), dns: dnsInstructionsFor(clean) });
  } catch (err) {
    next(err);
  }
}

async function verifyDomain(req, res, next) {
  try {
    const domainDoc = await Domain.findById(req.params.id);
    if (!domainDoc) return res.status(404).json({ message: 'Domain not found' });

    const isVerified = await verifyDomainDns(domainDoc.domain);
    domainDoc.verificationStatus = isVerified ? 'verified' : 'failed';
    // We don't actually provision a certificate here — this assumes a
    // reverse-proxy layer (Cloudflare, Caddy, Let's Encrypt automation)
    // handles real SSL issuance once DNS is pointed correctly. See the
    // note on this feature for the limitation this implies.
    domainDoc.sslStatus = isVerified ? 'active' : 'failed';
    if (isVerified) domainDoc.verifiedAt = new Date();
    await domainDoc.save();

    res.json(toPublicDomain(domainDoc));
  } catch (err) {
    next(err);
  }
}

async function makePrimary(req, res, next) {
  try {
    const domainDoc = await Domain.findById(req.params.id);
    if (!domainDoc) return res.status(404).json({ message: 'Domain not found' });
    if (domainDoc.verificationStatus !== 'verified') {
      return res.status(400).json({ message: 'Only a verified domain can be made primary' });
    }

    await Domain.updateMany({ _id: { $ne: domainDoc._id } }, { isPrimary: false });
    domainDoc.isPrimary = true;
    await domainDoc.save();

    res.json(toPublicDomain(domainDoc));
  } catch (err) {
    next(err);
  }
}

async function removeDomain(req, res, next) {
  try {
    const domainDoc = await Domain.findByIdAndDelete(req.params.id);
    if (!domainDoc) return res.status(404).json({ message: 'Domain not found' });
    res.json({ message: 'Domain removed' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listDomains, addDomain, verifyDomain, makePrimary, removeDomain };
