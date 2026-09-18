const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const LEADS_PATH = path.join(__dirname, '..', 'data', 'membership_leads.json');

function readLeads() {
  try {
    if (!fs.existsSync(LEADS_PATH)) return [];
    return JSON.parse(fs.readFileSync(LEADS_PATH, 'utf-8'));
  } catch (e) {
    return [];
  }
}

function writeLeads(leads) {
  try {
    fs.writeFileSync(LEADS_PATH + '.tmp', JSON.stringify(leads, null, 2), 'utf-8');
    fs.renameSync(LEADS_PATH + '.tmp', LEADS_PATH);
    return true;
  } catch (e) {
    return false;
  }
}

// GET /api/membership - List membership leads (Admin)
router.get('/', (req, res) => {
  const leads = readLeads();
  res.json({ success: true, count: leads.length, data: leads });
});

// POST /api/membership - Submit new membership / contact inquiry
router.post('/', (req, res) => {
  const { companyName, contactPerson, email, phone, sector, employeesCount, servicesOfInterest, message, vatNumber, address, pec } = req.body;

  if (typeof companyName !== 'string' || !companyName.trim() || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Ragione Sociale ed Email sono obbligatori' });
  }

  const leads = readLeads();
  const newLead = {
    id: 'lead-' + Date.now(),
    companyName: companyName.trim(),
    vatNumber: typeof vatNumber === 'string' ? vatNumber.trim() : '',
    address: typeof address === 'string' ? address.trim() : '',
    pec: typeof pec === 'string' ? pec.trim() : '',
    contactPerson: contactPerson || '',
    email: email.trim(),
    phone: phone || '',
    sector: sector || 'PMI Generale',
    employeesCount: employeesCount || '1-10',
    servicesOfInterest: Array.isArray(servicesOfInterest) ? servicesOfInterest : [servicesOfInterest || 'Consulenza Generale'],
    message: message || '',
    status: 'nuovo',
    submittedAt: new Date().toISOString()
  };

  leads.unshift(newLead);
  if (!writeLeads(leads)) return res.status(500).json({ success: false, message: 'Salvataggio non riuscito. Riprova.' });

  res.status(201).json({
    success: true,
    message: 'Richiesta salvata nella demo locale. Nessuna email è stata inviata.',
    data: newLead
  });
});

module.exports = router;
