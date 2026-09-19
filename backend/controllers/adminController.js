const Submission = require('../models/Submission');

const VALID_STATUSES = ['Pending', 'Under review', 'Approved', 'Rejected'];

/**
 * Map dashboard type labels → MongoDB field conditions.
 *
 * Form project intimationFor values:
 *   Staff | Marketing | BrillexStaff | GPABrillexStaff | GPA
 *
 * Dashboard labels (6 tabs):
 *   Staff Mediclaim      → formType=GMC, intimationFor IN [Staff]
 *   Marketing Mediclaim  → formType=GMC, intimationFor=Marketing
 *   GMC Brillex Staff    → formType=GMC, intimationFor=BrillexStaff   (policy GMP0000216000100)
 *   Personal Accident    → formType=GPA, intimationFor=GPA
 *   GPA Brillex Staff    → formType=GPA, intimationFor=GPABrillexStaff (policy GPP0000307000100)
 */
function buildTypeFilter(type) {
  switch (type) {
    case 'Staff Mediclaim':
      return { formType: 'GMC', intimationFor: 'Staff' };
    case 'Marketing Mediclaim':
      return { formType: 'GMC', intimationFor: 'Marketing' };
    case 'GMC Brillex Staff':
      return { formType: 'GMC', intimationFor: 'BrillexStaff' };
    case 'Personal Accident':
      return { formType: 'GPA', intimationFor: 'GPA' };
    case 'GPA Brillex Staff':
      return { formType: 'GPA', intimationFor: 'GPABrillexStaff' };
    default:
      return {};
  }
}

/**
 * Derive the display label for the typeCounts aggregation output.
 */
function labelForRecord(formType, intimationFor) {
  if (formType === 'GPA') {
    return intimationFor === 'GPABrillexStaff' ? 'GPA Brillex Staff' : 'Personal Accident';
  }
  if (intimationFor === 'Marketing')    return 'Marketing Mediclaim';
  if (intimationFor === 'BrillexStaff') return 'GMC Brillex Staff';
  return 'Staff Mediclaim';
}

/**
 * GET /api/admin/submissions
 * Query params: type, dateFrom, dateTo, search, page, pageSize
 */
exports.getSubmissions = async (req, res) => {
  try {
    const { type, dateFrom, dateTo, search, page = 1, pageSize = 6 } = req.query;

    const filter = {};

    // ── type filter ──
    Object.assign(filter, buildTypeFilter(type));

    // ── date range filter (on submittedAt) ──
    if (dateFrom || dateTo) {
      filter.submittedAt = {};
      if (dateFrom) {
        // start of the "from" day
        filter.submittedAt.$gte = new Date(dateFrom + 'T00:00:00.000Z');
      }
      if (dateTo) {
        // end of the "to" day (inclusive)
        filter.submittedAt.$lte = new Date(dateTo + 'T23:59:59.999Z');
      }
    }

    // ── search filter (trim server-side — client sends raw value incl. spaces) ──
    const trimmed = search ? search.trim() : '';
    if (trimmed) {
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex   = new RegExp(escaped, 'i');
      filter.$or = [
        { firstName:    regex },
        { surname:      regex },
        { employeeCode: regex },
        { policyNumber: regex },
        { patientName:  regex },
      ];
    }

    const pageNum     = Math.max(1, parseInt(page,     10));
    const pageSizeNum = Math.min(100, Math.max(1, parseInt(pageSize, 10)));
    const skip        = (pageNum - 1) * pageSizeNum;

    const [total, records] = await Promise.all([
      Submission.countDocuments(filter),
      Submission.find(filter)
        .sort({ submittedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSizeNum)
        .lean(),
    ]);

    // Per-type counts — unaffected by the current type filter so all tabs show real totals.
    // Apply date + search filters but not type.
    const baseFilter = {};
    if (filter.submittedAt) baseFilter.submittedAt = filter.submittedAt;
    if (filter.$or)         baseFilter.$or         = filter.$or;

    const rawCounts = await Submission.aggregate([
      { $match: baseFilter },
      { $group: { _id: { formType: '$formType', intimationFor: '$intimationFor' }, count: { $sum: 1 } } },
    ]);

    const typeCounts = {
      'Staff Mediclaim':     0,
      'Marketing Mediclaim': 0,
      'GMC Brillex Staff':   0,
      'Personal Accident':   0,
      'GPA Brillex Staff':   0,
    };
    rawCounts.forEach(({ _id, count }) => {
      const label = labelForRecord(_id.formType, _id.intimationFor);
      if (label in typeCounts) typeCounts[label] += count;
    });

    return res.json({ total, page: pageNum, pageSize: pageSizeNum, records, typeCounts });
  } catch (err) {
    console.error('getSubmissions error:', err);
    return res.status(500).json({ message: 'Failed to fetch submissions.' });
  }
};

/**
 * PATCH /api/admin/submissions/:id/status
 * Body: { status }
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}.`,
      });
    }

    const submission = await Submission.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    return res.json({ record: submission });
  } catch (err) {
    if (err.name === 'CastError')
      return res.status(400).json({ message: 'Invalid submission ID.' });
    console.error('updateStatus error:', err);
    return res.status(500).json({ message: 'Failed to update status.' });
  }
};
