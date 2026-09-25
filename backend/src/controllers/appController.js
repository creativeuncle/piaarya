const InstalledApp = require('../models/InstalledApp');
const APPS_CATALOG = require('../constants/appsCatalog');

async function listApps(req, res, next) {
  try {
    const installed = await InstalledApp.find();
    const installedByKey = new Map(installed.map((i) => [i.key, i]));

    const apps = APPS_CATALOG.map((app) => {
      const record = installedByKey.get(app.key);
      return {
        ...app,
        isInstalled: Boolean(record),
        isEnabled: record ? record.isEnabled : false,
        installedAt: record?.installedAt || null,
      };
    });

    res.json(apps);
  } catch (err) {
    next(err);
  }
}

async function installApp(req, res, next) {
  try {
    const { key } = req.params;
    const catalogApp = APPS_CATALOG.find((a) => a.key === key);
    if (!catalogApp) return res.status(404).json({ message: 'App not found' });

    const existing = await InstalledApp.findOne({ key });
    if (existing) return res.status(400).json({ message: 'App already installed' });

    await InstalledApp.create({ key, isEnabled: true });
    res.status(201).json({ message: 'App installed' });
  } catch (err) {
    next(err);
  }
}

async function toggleApp(req, res, next) {
  try {
    const { key } = req.params;
    const { isEnabled } = req.body;
    const record = await InstalledApp.findOne({ key });
    if (!record) return res.status(404).json({ message: 'App is not installed' });

    record.isEnabled = Boolean(isEnabled);
    await record.save();
    res.json({ message: 'App updated', isEnabled: record.isEnabled });
  } catch (err) {
    next(err);
  }
}

async function uninstallApp(req, res, next) {
  try {
    const { key } = req.params;
    const record = await InstalledApp.findOneAndDelete({ key });
    if (!record) return res.status(404).json({ message: 'App is not installed' });
    res.json({ message: 'App uninstalled' });
  } catch (err) {
    next(err);
  }
}

module.exports = { listApps, installApp, toggleApp, uninstallApp };
