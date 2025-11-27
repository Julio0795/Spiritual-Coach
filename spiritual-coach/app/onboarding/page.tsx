import GuruSelector from '@/components/onboarding/GuruSelector'

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 overflow-y-auto">
      <header className="w-full max-w-7xl mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 tracking-tight text-center">
          Choose your Council
        </h1>
      </header>
      <div className="w-full max-w-7xl">
        <GuruSelector />
      </div>
    </div>
  )
}

