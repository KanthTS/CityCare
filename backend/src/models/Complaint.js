const mongoose = require('mongoose');

const historyEntrySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    actorRole: { type: String, default: 'system' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const affectedCitizenSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reportedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true, required: true },
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    issueType: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, default: '' },

    image: { type: String, required: true },
    beforeImage: { type: String, default: null },
    afterImage: { type: String, default: null },

    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
    },

    severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },

    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },

    status: {
      type: String,
      enum: ['reported', 'verified', 'assigned', 'accepted', 'in_progress', 'resolved', 'closed', 'reopened'],
      default: 'reported',
    },

    aiAnalysis: {
      detectedIssue: String,
      confidence: Number,
      severity: String,
      category: String,
      recommendedDepartment: String,
      isSafeSelfFix: Boolean,
      selfFixSteps: [String],
      dangerReason: String,
    },

    selfFixAttempted: { type: Boolean, default: false },

    duplicateOf: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint', default: null },
    affectedCitizens: [affectedCitizenSchema],

    citizenVerification: {
      status: { type: String, enum: ['pending', 'resolved', 'not_resolved'], default: 'pending' },
      respondedAt: { type: Date, default: null },
    },

    history: [historyEntrySchema],

    assignedAt: { type: Date, default: null },
    acceptedAt: { type: Date, default: null },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

complaintSchema.index({ 'location.lat': 1, 'location.lng': 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ category: 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
