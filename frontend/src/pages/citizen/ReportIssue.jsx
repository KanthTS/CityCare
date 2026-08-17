import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { aiApi, complaintApi } from '../../api/endpoints'
import LocationPicker from '../../components/map/LocationPicker'
import PriorityBadge from '../../components/ui/PriorityBadge'
import Spinner from '../../components/ui/Spinner'

const STEPS = ['Capture', 'AI Analysis', 'Next Steps']

export default function ReportIssue() {
  const navigate = useNavigate()
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  const [step, setStep] = useState(0)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [location, setLocation] = useState(null)
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')

  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)
  const [error, setError] = useState('')

  const [selfFixChoice, setSelfFixChoice] = useState(null) // 'yes' | 'no'
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleFile = (file) => {
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const canAnalyze = photoFile && location

  const runAnalysis = async () => {
    setError('')
    setAnalyzing(true)
    try {
      const formData = new FormData()
      formData.append('image', photoFile)
      formData.append('description', description)
      const { data } = await aiApi.analyze(formData)
      setAnalysis(data.analysis)
      setUploadedImage(data.image)
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.message || 'AI analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const submitComplaint = async () => {
    setSubmitting(true)
    setError('')
    try {
      const { data } = await complaintApi.create({
        issueType: analysis.detectedIssue,
        category: analysis.category,
        description,
        image: uploadedImage,
        lat: location.lat,
        lng: location.lng,
        address,
        severity: analysis.severity,
        priority: analysis.priority,
        departmentCode: analysis.departmentCode,
        aiAnalysis: analysis,
        selfFixAttempted: selfFixChoice === 'yes',
      })
      setResult(data)
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Report an Issue</h1>
        <p className="mt-1 text-sm text-slate-500">Photo → Location → AI Analysis → Resolution</p>
      </div>

      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                i <= step ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </div>
            <span className={`text-xs font-medium ${i <= step ? 'text-slate-900' : 'text-slate-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`h-px flex-1 ${i < step ? 'bg-brand-600' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 ring-1 ring-inset ring-rose-200">{error}</div>
      )}

      {step === 0 && (
        <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Photo</h2>
            <p className="mb-3 text-xs text-slate-500">Take a photo or upload one from your gallery.</p>
            {photoPreview ? (
              <div className="relative">
                <img src={photoPreview} alt="preview" className="h-56 w-full rounded-xl object-cover" />
                <button
                  onClick={() => {
                    setPhotoFile(null)
                    setPhotoPreview(null)
                  }}
                  className="absolute right-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow hover:bg-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-1 flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-slate-500 hover:border-brand-400 hover:text-brand-600"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-sm font-medium">Take Photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex flex-1 flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 py-8 text-slate-500 hover:border-brand-400 hover:text-brand-600"
                >
                  <span className="text-2xl">🖼️</span>
                  <span className="text-sm font-medium">Upload Photo</span>
                </button>
              </div>
            )}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Location</h2>
            <p className="mb-3 text-xs text-slate-500">Capture your current GPS location so the issue can be mapped.</p>
            <LocationPicker value={location} onChange={setLocation} />
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street / landmark (optional)"
              className="mt-3 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900">Description (optional)</h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Describe what you see — e.g. size, exact spot, any hazards..."
              className="mt-2 w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <button
            onClick={runAnalysis}
            disabled={!canAnalyze || analyzing}
            className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analyzing ? 'Analyzing with AI…' : 'Analyze Issue with AI'}
          </button>
          {!canAnalyze && <p className="text-center text-xs text-slate-400">Add a photo and location to continue.</p>}
        </div>
      )}

      {step === 1 && analysis && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-brand-600">
              <span>🤖</span> AI Image Analysis
            </div>
            <div className="mt-4 flex gap-4">
              <img src={uploadedImage} alt="issue" className="h-28 w-28 flex-shrink-0 rounded-xl object-cover" />
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-xs text-slate-500">Detected Issue</p>
                  <p className="text-lg font-semibold text-slate-900">{analysis.detectedIssue}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Severity</p>
                    <PriorityBadge priority={analysis.severity} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Priority</p>
                    <PriorityBadge priority={analysis.priority} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-xs text-slate-500">Category</p>
                <p className="font-medium text-slate-800">{analysis.category}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Recommended Department</p>
                <p className="font-medium text-slate-800">{analysis.departmentCode}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">AI Confidence</p>
                <p className="font-medium text-slate-800">{analysis.confidence}%</p>
              </div>
            </div>
          </div>

          {analysis.isSafeSelfFix ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">Would you like to try fixing this yourself?</h3>
              <p className="mt-1 text-sm text-slate-500">This issue looks minor and safe for basic self-help.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSelfFixChoice('yes')}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                    selfFixChoice === 'yes' ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  ✅ Yes — Show Me How
                </button>
                <button
                  onClick={() => setSelfFixChoice('no')}
                  className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                    selfFixChoice === 'no' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🏛️ No — Contact Municipal Authority
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="flex items-center gap-2 text-base font-semibold text-amber-800">⚠️ Not safe for self-repair</h3>
              <p className="mt-1 text-sm text-amber-700">{analysis.dangerReason}</p>
              <p className="mt-3 text-sm text-amber-800">We recommend contacting the municipal authority directly.</p>
            </div>
          )}

          {selfFixChoice === 'yes' && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="text-base font-semibold text-emerald-800">Step-by-step guidance</h3>
              <ol className="mt-3 space-y-2">
                {analysis.selfFixSteps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-emerald-900">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-semibold text-white">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/citizen')}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  ✅ It's Fixed — Done
                </button>
                <button
                  onClick={submitComplaint}
                  disabled={submitting}
                  className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  {submitting ? 'Submitting…' : "Didn't work — Contact Municipal Authority"}
                </button>
              </div>
            </div>
          )}

          {(selfFixChoice === 'no' || !analysis.isSafeSelfFix) && (
            <button
              onClick={submitComplaint}
              disabled={submitting}
              className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting complaint…' : 'Submit to Municipal Authority'}
            </button>
          )}
        </div>
      )}

      {step === 2 && result && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            {result.duplicate ? 'Merged with an existing report' : 'Complaint submitted successfully'}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {result.duplicate
              ? `We found that this issue is already being tracked as ${result.complaint.complaintId}. Your report has been linked to it and you'll receive all status updates.`
              : `Your complaint ${result.complaint.complaintId} has been submitted and is pending verification.`}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={() => navigate(`/complaints/${result.complaint._id}`)}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              View Complaint
            </button>
            <button
              onClick={() => navigate('/citizen')}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
