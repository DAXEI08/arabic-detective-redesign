import { Link, useNavigate } from 'react-router-dom'
import { TopBar } from '../components/common/TopBar'
import { Stars } from '../components/common/Stars'
import { Ar } from '../components/common/RichText'
import { SyncBadge } from '../components/common/SyncStatus'
import { CASES } from '../data/cases'
import { completedCount, totalXp } from '../engine/analytics'
import { getRank } from '../engine/scoring'
import { isCaseUnlocked, useActivePlayer, usePlayerStore } from '../stores/playerStore'
import { useGameStore } from '../stores/gameStore'
import { useUiStore } from '../stores/uiStore'

type Status = 'solved' | 'active' | 'new' | 'locked'
const STATUS: Record<Status, { label: string; cls: string; action: string }> = {
  solved: { label: 'Selesai', cls: 'stamp-green', action: 'Main lagi' },
  active: { label: 'Berlangsung', cls: 'stamp-amber', action: 'Lanjutkan' },
  new: { label: 'Baru', cls: 'stamp-amber', action: 'Buka case' },
  locked: { label: 'Terkunci', cls: 'stamp-mute', action: '' },
}

function Difficulty({ level }: { level: number }) {
  return (
    <span className="inline-flex items-center gap-1" role="img" aria-label={`Tingkat ${level} dari 5`}>
      {Array.from({ length: 5 }).map((_, k) => <span key={k} className={`h-1.5 w-3.5 rounded-sm ${k < level ? 'bg-current' : 'bg-current opacity-20'}`} />)}
    </span>
  )
}

/** The case archive: one ledger row per file, status as a stamp, no identical tiles. */
export function CaseSelect() {
  const player = useActivePlayer()!
  const settings = usePlayerStore((s) => s.settings)
  const nav = useNavigate()
  const push = useUiStore((s) => s.push)
  const session = useGameStore((s) => s.session)
  const xp = totalXp(player)
  const { rank, next, progress } = getRank(xp)
  const done = completedCount(player)

  return (
    <>
      <TopBar right={
        <nav className="flex items-center text-xs" aria-label="Menu">
          {[['/achievements', 'Pencapaian'], ['/teacher', 'Mode Guru'], ['/settings', 'Pengaturan']].map(([to, label]) => (
            <Link key={to} className={`tap items-center whitespace-nowrap px-2 font-mono text-[11px] uppercase tracking-[.08em] text-cream-300 hover:text-cream-100 sm:px-3 sm:text-xs sm:tracking-[.1em] ${to === '/teacher' ? 'hidden sm:inline-flex' : 'inline-flex'}`} to={to}>{label}</Link>
          ))}
        </nav>} />
      <main className="mx-auto grid max-w-page gap-6 px-4 py-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-8 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="order-last lg:order-none lg:sticky lg:top-[72px] lg:self-start">
          <section className="paper reg p-5" aria-label="Berkas penyelidik">
            <p className="label">Berkas penyelidik</p>
            <p className="mt-2 text-xl font-bold leading-tight">{player.name}</p>
            <p className="docno">{player.className || 'Tanpa kelas'}</p>
            <Ar size="lg" className="mt-2 block text-left text-gold-700">{rank.ar}</Ar>
            <p className="-mt-1 text-sm text-ink-600">{rank.idn}</p>
            <div className="rule mt-4 pt-3">
              <div className="flex items-baseline justify-between"><span className="docno !text-ink-900">{xp.toLocaleString('id-ID')} XP</span><span className="docno">{next ? `${next.min.toLocaleString('id-ID')} XP → ${next.idn}` : 'Peringkat tertinggi'}</span></div>
              <div className="mt-1.5 h-1.5 bg-ink-900/15" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label="Kemajuan peringkat">
                <div className="h-full bg-gold-700" style={{ width: `${progress * 100}%` }} />
              </div>
            </div>
            <dl className="rule mt-4 grid grid-cols-2 pt-3">
              <div><dt className="label">Kasus selesai</dt><dd className="font-mono text-lg">{String(done).padStart(2, '0')}/{String(CASES.length).padStart(2, '0')}</dd></div>
              <div><dt className="label">Pencapaian</dt><dd className="font-mono text-lg">{Object.keys(player.achievements).length}</dd></div>
            </dl>
          </section>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {settings.demoUnlock && <span className="stamp stamp-amber" title="Semua kasus terbuka untuk presentasi">Mode Presentasi</span>}
            <SyncBadge />
          </div>
        </aside>

        <section aria-labelledby="archive-title">
          <div className="flex items-end justify-between border-b border-cream-100/60 pb-2">
            <h1 id="archive-title" className="text-2xl font-bold tracking-tight">Berkas kasus</h1>
            <span className="docno">{String(CASES.length).padStart(2, '0')} BERKAS · PELABUHAN</span>
          </div>
          <div className="label hidden grid-cols-[72px_minmax(0,1fr)_120px_190px_110px] gap-4 border-b border-ink-600 px-3 py-2 lg:grid" aria-hidden>
            <span>No.</span><span>Kasus</span><span>Tingkat</span><span>Status</span><span />
          </div>
          <ol>
            {CASES.map((c) => {
              const pr = player.progress[c.id]
              const unlocked = isCaseUnlocked(player, settings, c)
              const inProgress = session?.caseId === c.id && session.playerId === player.id && session.stage === 'play'
              const status: Status = !unlocked ? 'locked' : pr?.completed ? 'solved' : inProgress ? 'active' : 'new'
              const st = STATUS[status]
              return (
                <li key={c.id} className="border-b border-ink-600">
                  <button
                    onClick={() => (unlocked ? nav(`/case/${c.id}`) : push({ kind: 'info', title: `Case ${c.number} masih terkunci`, body: `Selesaikan Case ${c.number - 1} dulu.` }))}
                    aria-disabled={!unlocked}
                    className={`grid w-full grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 gap-y-2 px-3 py-4 text-left transition-colors lg:grid-cols-[72px_minmax(0,1fr)_120px_190px_110px] ${unlocked ? 'hover:bg-ink-800' : 'opacity-60'}`}>
                    <span className={`font-mono text-3xl font-medium tabular-nums lg:text-4xl ${unlocked ? 'text-gold-400' : 'text-ink-400'}`}>{String(c.number).padStart(2, '0')}</span>
                    <span className="block min-w-0">
                      <Ar size="lg" className="block text-left leading-snug">{c.titleAr}</Ar>
                      <span className="block font-semibold">{c.titleId}</span>
                      <span className="mt-0.5 block text-sm text-cream-300">{c.description}</span>
                    </span>
                    <span className="col-start-2 flex items-center gap-2 text-cream-300 lg:col-start-auto"><span className="label lg:hidden">Tingkat</span><Difficulty level={c.difficulty} /></span>
                    <span className="col-start-2 flex items-center gap-3 lg:col-start-auto">
                      <span className={`stamp ${st.cls}`}>{st.label}</span>
                      {status === 'solved' && <Stars value={pr.stars} size={15} />}
                    </span>
                    <span className="col-start-2 font-mono text-xs uppercase tracking-[.12em] text-gold-400 lg:col-start-auto lg:text-right">{st.action && `${st.action} →`}</span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>
      </main>
    </>
  )
}
