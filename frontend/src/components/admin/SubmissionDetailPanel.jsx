import { displayType } from './Badges';

function Field({ label, value, mono }) {
  if (!value && value !== 0) return null;
  return (
    <div className="detail-field">
      <span className="detail-field__label">{label}</span>
      <span className={`detail-field__value${mono ? ' mono' : ''}`}>{value}</span>
    </div>
  );
}

function Section({ heading, children }) {
  return (
    <div className="detail-section">
      <h3 className="detail-section__heading">{heading}</h3>
      {children}
    </div>
  );
}

function empName(r) {
  return [r.firstName, r.middleName, r.surname].filter(Boolean).join(' ');
}

export default function SubmissionDetailPanel({ record }) {
  const isAccident = record.formType === 'GPA';
  const typeLabel  = displayType(record);

  return (
    <div className="detail-panel">
      <div className="detail-panel__sections">

        <Section heading="Employee Details">
          <Field label="Employee Name"  value={empName(record)} />
          <Field label="Employee Code"  value={record.employeeCode} mono />
          <Field label="Mobile"         value={record.mobile} mono />
          <Field label="Email"          value={record.email} />
          <Field label="Intimation For" value={typeLabel} />
        </Section>

        <Section heading="Patient Details">
          <Field label="Patient Name"  value={record.patientName} />
          <Field label="Relationship"  value={record.relationship} />
          <Field label="Policy Number" value={record.policyNumber} mono />
          <Field label="Reference No." value={record.referenceNo} mono />
        </Section>

        {isAccident ? (
          <Section heading="Accident Details">
            <Field label="Date &amp; Time" value={record.accidentDateTime} />
            <Field label="Location"        value={record.accidentLocation} />
            <Field label="Description"     value={record.accidentDescription} />
            <Field label="Injury"          value={record.injuryDescription} />
            <Field label="FIR Details"     value={record.firDetails} />
          </Section>
        ) : (
          <Section heading="Medical Details">
            <Field label="Diagnosis"           value={record.diagnosis} />
            <Field label="Nature of Treatment" value={record.treatmentNature} />
            <Field label="Date of Admission"   value={record.admissionDateTime} />
          </Section>
        )}

        <Section heading="Hospital Details">
          <Field label="Doctor"           value={record.doctorName} />
          <Field label="Hospital"         value={record.hospitalName} />
          <Field label="Hospital Address" value={record.hospitalAddress} />
          <Field label="Pincode"          value={record.pincode} mono />
        </Section>

      </div>
    </div>
  );
}
