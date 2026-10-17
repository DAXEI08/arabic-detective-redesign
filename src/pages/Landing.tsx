import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Logo } from '../components/common/TopBar'
import { Ar } from '../components/common/RichText'
import { HarborPlate } from '../components/game/HarborPlate'
import { CASES } from '../data/cases'
import { useActivePlayer } from '../stores/playerStore'

/** Cover sheet of the dossier: title, theme, three facts, one action. The plate on the right is the map of where the cases happen. */
export function Landing() {
  const nav = useNavigate()
  const player = useActivePlayer()
  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-page flex-col px-4 lg:px-8">
        <header className="flex items-center justify-between py-4">
          <Logo />
          <Link to="/teacher" className="tap inline-flex items-center font-mono text-xs uppercase tracking-[.14em] text-cream-300 hover:text-cream-100">Mode Guru</Link>
        </header>

        <div className="grid flex-1 items-center gap-8 pb-10 pt-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14 lg:pb-14">
          <section>
            <p className="docno">BERKAS NO. AD-001 · PELABUHAN</p>
            <h1 className="mt-3 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-6xl xl:text-7xl">Arabic<br />Detective</h1>
            <Ar size="xl" className="mt-2 block text-left text-gold-400">المُحَقِّقُ اللُّغَوِيُّ</Ar>

            <div className="rule mt-6 max-w-xl pt-4">
              <p className="label">Tema</p>
              <Ar size="lg" className="block text-left">السَّفَرُ عَبْرَ الْمِينَاءِ</Ar>
              <p className="mt-1 max-w-md text-base text-cream-200">Pahami petunjuk. Hubungkan bukti. Pecahkan kasus dengan bahasa Arab.</p>
            </div>

            <dl className="mt-6 grid max-w-xl grid-cols-3 border-y border-ink-600 py-3">
              {[['Kasus', String(CASES.length).padStart(2, '0')], ['Sasaran', 'Siswa SMK'], ['Petunjuk', 'Offline']].map(([k, v]) => (
                <div key={k} className="pr-3"><dt className="label">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>
              ))}
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button variant="primary" size="lg" onClick={() => nav(player ? '/cases' : '/setup')}>{player ? `Lanjutkan investigasi` : 'Mulai investigasi'}</Button>
              {player && <Button size="lg" onClick={() => nav('/setup')}>Ganti siswa</Button>}
            </div>
            {player && <p className="mt-3 text-sm text-cream-300">Masuk sebagai <span className="font-semibold text-cream-100">{player.name}</span></p>}
          </section>

          <section className="border border-ink-600 bg-ink-950 lg:order-none" aria-label="Peta pelabuhan">
            <HarborPlate className="block h-auto w-full" />
          </section>
        </div>
      </div>
    </main>
  )
}
