/**
 * Submission model — mirrors the schema used by the Intimation Form project.
 *
 * This model connects to the SAME database and collection that the form
 * submission app writes to (intimation-form / submissions).  We do NOT
 * re-define validation here because these records are created by the form
 * app; the dashboard only reads and patches the `status` field.
 *
 * Field mapping vs. the dashboard's previous schema:
 *   employee.name      → firstName + middleName + surname (combined in helpers)
 *   employee.code      → employeeCode
 *   employee.mobile    → mobile
 *   employee.email     → email
 *   patient.name       → patientName
 *   patient.relationship → relationship
 *   formType           → derived from formType (GMC/GPA) + intimationFor
 *   mediclaim.*        → diagnosis, treatmentNature, admissionDateTime, doctorName, hospitalName, hospitalAddress
 *   accident.*         → accidentLocation, accidentDescription, injuryDescription, accidentDateTime, firDetails, doctorName, hospitalName, hospitalAddress
 */

const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    referenceNo:         { type: String },
    idempotencyKey:      { type: String },

    // GMC or GPA
    formType:            { type: String, enum: ['GMC', 'GPA'] },
    // Staff | Marketing | BrillexStaff | GPABrillexStaff | GPA
    intimationFor:       { type: String },

    policyNumber:        { type: String },

    // Employee (flat fields from the form)
    employeeCode:        { type: String },
    firstName:           { type: String },
    middleName:          { type: String, default: '' },
    surname:             { type: String },
    mobile:              { type: String, default: '' },
    email:               { type: String, default: '' },

    // Patient
    patientName:         { type: String },
    relationship:        { type: String },

    // GMC (Mediclaim) fields
    diagnosis:           { type: String, default: '' },
    treatmentNature:     { type: String, default: '' },
    admissionDateTime:   { type: String, default: '' },

    // GPA (Accident) fields
    accidentLocation:    { type: String, default: '' },
    accidentDescription: { type: String, default: '' },
    injuryDescription:   { type: String, default: '' },
    accidentDateTime:    { type: String, default: '' },
    firDetails:          { type: String, default: '' },

    // Shared hospital fields
    doctorName:          { type: String },
    hospitalName:        { type: String },
    hospitalAddress:     { type: String },
    pincode:             { type: String },

    agree:               { type: Boolean },
    submittedAt:         { type: Date },

    // Status is the only field the dashboard writes back
    status: {
      type: String,
      enum: ['Pending', 'Under review', 'Approved', 'Rejected'],
      default: 'Pending',
    },
  },
  {
    // Use the SAME collection the form app writes to
    collection: 'submissions',
    timestamps: true,
  }
);

// Indexes for the dashboard's query patterns
submissionSchema.index({ status: 1 });
submissionSchema.index({ formType: 1 });
submissionSchema.index({ intimationFor: 1 });
submissionSchema.index({
  firstName: 'text',
  surname: 'text',
  employeeCode: 'text',
  policyNumber: 'text',
  patientName: 'text',
});

module.exports = mongoose.model('Submission', submissionSchema);
