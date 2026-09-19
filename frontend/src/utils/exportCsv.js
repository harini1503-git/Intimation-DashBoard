/**
 * exportToCsv
 *
 * Converts an array of submission records (flat schema from the Intimation
 * Form project) to a UTF-8 CSV file and triggers a browser download.
 *
 * @param {Array}  records  — submission objects from the API
 * @param {string} [filename]
 */
export function exportToCsv(records, filename) {
  const headers = [
    'Reference No.',
    'Submitted',
    'Form Type',
    'Intimation For',
    'Status',
    'Employee Code',
    'Employee Name',
    'Mobile',
    'Email',
    'Policy Number',
    'Patient Name',
    'Relationship',
    // GMC (Mediclaim)
    'Diagnosis',
    'Nature of Treatment',
    'Date of Admission',
    // GPA (Accident)
    'Location of Accident',
    'Accident Description',
    'Injury Description',
    'Date of Accident',
    'FIR Details',
    // Hospital
    'Doctor',
    'Hospital',
    'Hospital Address',
    'Pincode',
  ];

  const rows = records.map((r) => {
    const isAccident = r.formType === 'GPA';
    const name = [r.firstName, r.middleName, r.surname].filter(Boolean).join(' ');
    return [
      r.referenceNo   ?? '',
      r.submittedAt   ? new Date(r.submittedAt).toLocaleString('en-IN') : '',
      r.formType      ?? '',
      r.intimationFor ?? '',
      r.status        ?? '',
      r.employeeCode  ?? '',
      name,
      r.mobile        ?? '',
      r.email         ?? '',
      r.policyNumber  ?? '',
      r.patientName   ?? '',
      r.relationship  ?? '',
      // GMC
      !isAccident ? (r.diagnosis        ?? '') : '',
      !isAccident ? (r.treatmentNature  ?? '') : '',
      !isAccident ? (r.admissionDateTime ?? '') : '',
      // GPA
      isAccident  ? (r.accidentLocation    ?? '') : '',
      isAccident  ? (r.accidentDescription ?? '') : '',
      isAccident  ? (r.injuryDescription   ?? '') : '',
      isAccident  ? (r.accidentDateTime    ?? '') : '',
      isAccident  ? (r.firDetails          ?? '') : '',
      // Hospital
      r.doctorName      ?? '',
      r.hospitalName    ?? '',
      r.hospitalAddress ?? '',
      r.pincode         ?? '',
    ];
  });

  const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), {
    href:     url,
    download: filename ?? `submissions-${Date.now()}.csv`,
  });
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
