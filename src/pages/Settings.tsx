import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { Modal } from '../components/common/Modal'
import { TopBar } from '../components/common/TopBar'
import { pendingCount } from '../services/cloud/supabase'
import { useActivePlayer, usePlayerStore } from '../stores/playerStore'
import { useGameStore } from '../stores/gameStore'
import { useUiStore } from '../stores/uiStore'

function Toggle({ label, desc, on, set }: { label: string; desc: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-ink-600 py-4">
      <div><p className="text-sm font-semibold">{label}</p><p className="max-w-md text-xs text-cream-300">{desc}</p></div>
      <button role="switch" aria-checked={on} aria-label={label} onClick={() => set(!on)} className={`tap relative h-7 w-14 shrink-0 rounded-sm border transition-colors ${on ? 'border-gold-500 bg-gold-500' : 'border-ink-500 bg-ink-900'}`}>
        <span className={`absolute top-0.5 h-5 w-6 rounded-sm transition-all ${on ? 'left-[1.625rem] bg-ink-900' : 'left-0.5 bg-cream-300'}`} />
      </button>
    </div>
  )
}

export function Settings() {
  const nav = useNavigate()
  const player = useActivePlayer()!
  const settings = usePlayerStore((s) => s.settings)
  const setSettings = usePlayerStore((s) => s.setSettings)
  const resetActive = usePlayerStore((s) => s.resetActiveProgress)
  const resetAll = usePlayerStore((s) => s.resetAll)
  const deletePlayer = usePlayerStore((s) => s.deletePlayer)
  const signOut = usePlayerStore((s) => s.signOut)
  const clearSession = useGameStore((s) => s.clearSession)
  const push = useUiStore((s) => s.push)
  const [confirm, setConfirm] = useState<'me' | 'all' | 'delete' | null>(null)

  const doReset = () => {
    clearSession()
    if (confirm === 'delete') { const id = player.id; deletePlayer(id); push({ kind: 'success', title: 'Siswa dihapus' }); nav('/setup') }
    else if (confirm === 'all') { resetAll(); push({ kind: 'success', title: 'Semua data dihapus' }); nav('/') }
    else { resetActive(); push({ kind: 'success', title: 'Progres direset', body: `Progres ${player.name} dikembalikan dari awal.` }) }
    setConfirm(null)
  }

  return (
    <>
      <TopBar title="Pengaturan" back="/cases" />
      <main className="mx-auto grid max-w-page gap-8 px-4 py-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12 lg:px-8 lg:py-10">
        <section aria-label="Tampilan dan mode">
          <h2 className="border-b border-cream-100/60 pb-2 text-xl font-bold">Tampilan &amp; mode</h2>
          <Toggle label="Kurangi animasi" desc="Matikan gerakan non-esensial." on={settings.reduceMotion} set={(v) => setSettings({ reduceMotion: v })} />
          <Toggle label="Mode Presentasi" desc="Untuk demo/juri: semua kasus terbuka tanpa urutan. Progres utama tidak diubah; membuka kasus lain tidak menandai kasus sebelumnya selesai." on={settings.demoUnlock} set={(v) => setSettings({ demoUnlock: v })} />
          <div className="border-b border-ink-600 py-4">
            <p className="text-sm font-semibold">Asisten Dalil</p>
            <p className="max-w-md text-xs text-cream-300">Sistem petunjuk bertingkat yang disusun sebelumnya. Berjalan sepenuhnya offline, hasilnya selalu konsisten, dan tidak pernah memberi jawaban akhir.</p>
          </div>
        </section>
        <section aria-label="Siswa aktif">
          <h2 className="border-b border-cream-100/60 pb-2 text-xl font-bold">Siswa aktif</h2>
          <p className="docno mt-3">{player.name.toUpperCase()}{player.className ? ` · ${player.className.toUpperCase()}` : ''}</p>
          <div className="mt-3"><Button onClick={() => { signOut(); nav('/setup') }}>Ganti siswa</Button></div>
          <div className="mt-8 border border-coral/60 p-4">
            <p className="label !text-bad">Tindakan permanen</p>
            <p className="mt-1 text-xs text-cream-300">Tidak bisa dibatalkan. Kamu akan diminta konfirmasi.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="danger" size="sm" onClick={() => setConfirm('me')}>Reset progres</Button>
              <Button variant="danger" size="sm" onClick={() => setConfirm('delete')}>Hapus siswa ini</Button>
              <Button variant="danger" size="sm" onClick={() => setConfirm('all')}>Hapus semua data</Button>
            </div>
          </div>
        </section>
      </main>
      <Modal open={confirm !== null} onClose={() => setConfirm(null)}
        title={confirm === 'all' ? 'Hapus semua data siswa?' : confirm === 'delete' ? `Hapus siswa ${player.name}?` : `Reset progres ${player.name}?`}>
        <p className="text-sm text-cream-300">
          {confirm === 'all' ? 'Seluruh siswa, progres, dan pencapaian di browser ini akan dihapus. Tindakan ini tidak bisa dibatalkan.'
            : confirm === 'delete' ? 'Siswa ini beserta progres dan pencapaiannya dihapus dari perangkat ini. Tidak bisa dibatalkan.'
              : 'XP, bintang, pencapaian, dan statistik siswa ini akan dikembalikan ke awal.'}
        </p>
        {pendingCount() > 0 && <p className="mt-2 border-l-2 border-gold-500 bg-ink-900 px-3 py-2 text-xs text-gold-300">Ada {pendingCount()} nilai yang belum terkirim ke cloud. Nilai itu tetap disimpan di antrean dan akan dikirim saat online.</p>}
        <div className="mt-4 flex justify-end gap-2"><Button onClick={() => setConfirm(null)}>Batal</Button><Button variant="danger" onClick={doReset}>{'Ya, lanjutkan'}</Button></div>
      </Modal>
    </>
  )
}
