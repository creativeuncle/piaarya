const dns = require('dns').promises;

// The IP address custom domains need to point at — set this to your
// production server's (or load balancer's) public IP.
const TARGET_SERVER_IP = process.env.TARGET_SERVER_IP || '';

// Resolves the domain's A records and checks whether our target IP is
// among them. Any DNS failure (NXDOMAIN, timeout, no A record yet) is
// treated as "not verified yet" rather than an error — that's the normal,
// expected state right after a store owner adds a domain and before their
// DNS has propagated.
async function verifyDomainDns(domain) {
  if (!TARGET_SERVER_IP) {
    throw new Error('TARGET_SERVER_IP is not configured on the server');
  }
  try {
    const addresses = await dns.resolve4(domain);
    return addresses.includes(TARGET_SERVER_IP);
  } catch {
    return false;
  }
}

module.exports = { verifyDomainDns, TARGET_SERVER_IP };
