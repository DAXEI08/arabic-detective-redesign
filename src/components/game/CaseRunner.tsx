import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CaseDefinition } from '../../types'
import { evidenceTotal } from '../../data/cases'
import { getPrep, getVocab } from '../../data/vocabulary'
import { pad2 } from '../../utils/arabic'
import { Button } from '../common/Button'
import { Ar, RichText } from '../common/RichText'
import { DalilPanel, FieldNotes } from '../dalil/DalilPanel'
import { EvidenceLog } from '../evidence/EvidenceLog'
import { NotesSheet } from '../evidence/NotesSheet'
import { useGameStore } from '../../stores/gameStore'
import { TaskView } from './tasks'
import { FeedbackBanner } from './FeedbackBanner'

interface Props { def: CaseDefinition; onFinish: () => void; onRestart: () => void }

/**
 * Investigation workspace.
 * ≥1280px: dossier (left) · task (centre, focal point) · evidence + field notes (right). 1024–1279px: task + right column.
 * <1024px: one column — instruction on top of the task; Dalil and notes open as sheets from the header.
 */
export function CaseRunner({ def, onFinish, onRestart }: Props) {
  const nav = useNavigate()
  const session = useGameStore((s) => s.session)!
  const completeTask = useGameStore((s) => s.completeTask)
  const advance = useGameStore((s) => s.advance)
  const [dalil, setDalil] = useState(false)
  const [notes, setNotes] = useState(false)
  const [gain, setGain] = useState<{ xp: number; key: number } | null>(null)
  const [msg, setMsg] = useState<string | undefined>()

  const idx = Math.min(session.taskIndex, def.tasks.length - 1)
  const task = def.tasks[idx]
  const solved = Boolean(session.taskStats[task.id]?.done)
  const last = idx === def.tasks.length - 1
  const evFound = session.evidence.filter((id) => def.clues.find((c) => c.id === id)?.isEvidence).length
  const vocab = task.vocab
    .map((id) => ({ id, v: getVocab(id) ?? getPrep(id) }))
    .filter((x): x is { id: string; v: NonNullable<typeof x.v> } => Boolean(x.v))

  function onSolved(text?: string) {
    const { xpGain } = completeTask(task)
    setMsg(text)
    if (xpGain > 0) setGain({ xp: xpGain, key: Date.now() })
  }
  function next() {
    setGain(null); setMsg(undefined)
    if (advance(def) === 'finished') onFinish()
  }

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-30 border-b border-ink-600 bg-ink-950">
        <div className="mx-auto flex h-12 max-w-page items-center gap-3 px-3 sm:px-4 lg:px-8">
          <button onClick={() => nav('/cases')} className="tap -ml-2 px-2 font-mono text-xs uppercase tracking-[.12em] text-cream-300 hover:text-cream-100" aria-label="Keluar ke daftar kasus">← Berkas</button>
          <p className="min-w-0 flex-1 truncate text-sm"><span className="font-mono font-medium text-gold-400">CASE {pad2(def.number)}</span><span className="hidden sm:inline"><span className="mx-2 text-ink-500">/</span><span className="text-cream-200">{def.titleId}</span></span></p>
          <ol className="hidden items-center gap-1 sm:flex" role="progressbar" aria-valuemin={0} aria-valuemax={def.tasks.length} aria-valuenow={idx + (solved ? 1 : 0)} aria-label="Kemajuan kasus">
            {def.tasks.map((t, i) => {
              const done = i < idx || (i === idx && solved)
              return <li key={t.id} className={`grid h-6 w-7 place-items-center border font-mono text-[11px] ${done ? 'border-gold-500 bg-gold-500 text-ink-900' : i === idx ? 'border-gold-500 text-gold-400' : 'border-ink-500 text-ink-400'}`}>{pad2(i + 1)}</li>
            })}
          </ol>
          <span className="docno hidden md:inline" title="XP kasus ini">{session.xp} XP</span>
          <div className="flex items-center lg:hidden">
            <button onClick={() => setNotes(true)} className="tap px-2 font-mono text-xs uppercase tracking-[.1em] text-cream-300 hover:text-cream-100">Catatan</button>
            <button onClick={() => setDalil(true)} className="tap border border-gold-500/70 px-2.5 font-mono text-xs uppercase tracking-[.1em] text-gold-400 hover:bg-ink-800" aria-label="Buka catatan lapangan Dalil">Dalil</button>
          </div>
        </div>
        <div className="flex h-1 gap-px sm:hidden" aria-hidden>
          {def.tasks.map((t, i) => <span key={t.id} className={`flex-1 ${i < idx || (i === idx && solved) ? 'bg-gold-500' : i === idx ? 'bg-gold-500/40' : 'bg-ink-600'}`} />)}
        </div>
      </header>

      <div className="mx-auto grid max-w-page gap-4 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-5 lg:px-6 lg:py-6 xl:grid-cols-[250px_minmax(0,1fr)_300px] 2xl:grid-cols-[290px_minmax(0,1fr)_340px] 2xl:gap-6 2xl:px-8">
        {/* LEFT · dossier + instruction + vocabulary (≥1280px; at 1024–1279 the instruction sits above the task) */}
        <aside className="hidden xl:sticky xl:top-[68px] xl:block xl:max-h-[calc(100vh-84px)] xl:self-start xl:overflow-y-auto" aria-label="Berkas kasus">
          <div className="paper reg p-4">
            <p className="docno">CASE {pad2(def.number)} · BERKAS</p>
            <Ar size="lg" className="mt-1 block text-left leading-snug">{def.titleAr}</Ar>
            <p className="font-semibold">{def.titleId}</p>
            <div className="rule mt-3 pt-3">
              <p className="label">Tujuan</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-[13px] leading-snug text-ink-800">{def.objectives.slice(0, 3).map((o) => <li key={o}>{o}</li>)}</ul>
            </div>
          </div>

          <ol className="mt-4" aria-label="Daftar tugas">
            {def.tasks.map((t, i) => {
              const done = Boolean(session.taskStats[t.id]?.done)
              const cur = i === idx
              return (
                <li key={t.id} className={`flex items-baseline gap-2 border-b border-ink-600 py-1.5 text-[13px] ${cur ? 'text-cream-100' : done ? 'text-cream-300' : 'text-ink-400'}`} aria-current={cur ? 'step' : undefined}>
                  <span className={`font-mono text-[11px] ${cur ? 'text-gold-400' : ''}`}>{pad2(i + 1)}</span>
                  <span className="flex-1 truncate">{t.titleId}</span>
                  {done && <span className="stamp stamp-green !px-1 !py-0 !text-[9px]">OK</span>}
                </li>
              )
            })}
          </ol>

          <div className="mt-4 border-l-2 border-gold-500 pl-3">
            <p className="label !text-gold-400">Perintah · tugas {pad2(idx + 1)}</p>
            <p className="mt-1 text-[15px] leading-relaxed"><RichText text={task.instruction} /></p>
          </div>

          {vocab.length > 0 && (
            <div className="mt-4">
              <p className="label">Kosakata tugas</p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {vocab.map(({ id, v }) => {
                  const known = def.showVocabMeaning || session.learned.includes(id)
                  return <li key={id} className="chip !normal-case !tracking-normal"><Ar size="sm" className="!leading-snug">{v.ar}</Ar>{known && <span className="text-xs">{v.idn}</span>}</li>
                })}
              </ul>
            </div>
          )}
        </aside>

        {/* CENTRE · the task */}
        <main className="min-w-0" aria-label="Tugas">
          <div className="mb-3 flex items-end justify-between gap-3 border-b border-cream-100/60 pb-2">
            <div>
              <p className="docno">TUGAS {pad2(idx + 1)} / {pad2(def.tasks.length)}</p>
              <h2 className="text-lg font-bold leading-tight sm:text-xl">{task.titleId}</h2>
            </div>
            <span className="docno md:hidden">{session.xp} XP · E {evFound}/{evidenceTotal(def)}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.section key={task.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <TaskView task={task} def={def} solved={solved} onSolved={onSolved} />
              {solved && msg && <div className="mt-3"><FeedbackBanner feedback={{ kind: 'good', text: msg }} /></div>}
            </motion.section>
          </AnimatePresence>
        </main>

        {/* RIGHT · evidence register + docked field notes (desktop) */}
        <aside className="hidden lg:sticky lg:top-[68px] lg:flex lg:max-h-[calc(100vh-84px)] lg:flex-col lg:gap-4 lg:self-start" aria-label="Bukti dan catatan">
          <EvidenceLog def={def} className="max-h-[30vh] shrink-0 overflow-y-auto" />
          <FieldNotes def={def} task={task} className="min-h-0 flex-1 overflow-y-auto" />
          <Button size="sm" onClick={() => setNotes(true)}>Buka catatan kasus</Button>
        </aside>
      </div>

      <AnimatePresence>
        {solved && (
          <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-gold-500 bg-ink-950 pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto flex max-w-page items-center justify-between gap-3 px-3 py-2.5 sm:px-4 lg:px-8">
              <div className="flex items-center gap-3">
                <span className="stamp stamp-green stamp-in">Terverifikasi</span>
                <span className="hidden sm:block">
                  <span lang="ar" dir="rtl" className="ar text-xl leading-none text-good">أَحْسَنْتَ!</span>
                  {gain && <motion.span key={gain.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 font-mono text-sm text-gold-400">+{gain.xp} XP{gain.xp > 100 && <span className="ml-1 text-xs text-cream-300">(tanpa petunjuk)</span>}</motion.span>}
                </span>
                {gain && <span className="font-mono text-sm text-gold-400 sm:hidden">+{gain.xp} XP</span>}
              </div>
              <Button variant="primary" size="lg" onClick={next}>{last ? 'Tutup kasus' : 'Lanjutkan investigasi'}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DalilPanel open={dalil} onClose={() => setDalil(false)} def={def} task={task} />
      <NotesSheet open={notes} onClose={() => setNotes(false)} def={def} onRestart={() => { setNotes(false); onRestart() }} />
    </div>
  )
}
