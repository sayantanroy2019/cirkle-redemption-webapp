import { useEffect, useRef } from 'react'

const QR_REGION_ID = 'qr-reader-region'

/**
 * Thin wrapper around html5-qrcode's continuous-scan mode. Mounts the camera
 * once; `active` toggles pause/resume rather than stop/start so "scan next"
 * is instant and we don't re-prompt for camera permission.
 *
 * html5-qrcode is loaded lazily (dynamic import) so it never delays the
 * login/event-picker screens — it's ~200KB and only the door screen needs it.
 */
export default function ScannerCamera({ active, onDecode, onUnavailable }) {
  const instanceRef = useRef(null)
  const startedRef = useRef(false)
  const onDecodeRef = useRef(onDecode)
  onDecodeRef.current = onDecode

  useEffect(() => {
    let cancelled = false

    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return
      const instance = new Html5Qrcode(QR_REGION_ID, { verbose: false })
      instanceRef.current = instance

      instance
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
          (decodedText) => onDecodeRef.current(decodedText),
          () => {}, // per-frame "no QR found this frame" — expected continuously, not an error
        )
        .then(() => {
          if (cancelled) {
            instance.stop().catch(() => {})
            return
          }
          startedRef.current = true
          if (!active) instance.pause(true)
        })
        .catch((err) => {
          if (!cancelled) onUnavailable(err)
        })
    })

    return () => {
      cancelled = true
      const instance = instanceRef.current
      if (!instance) return
      // clear() is synchronous (returns void, not a Promise) — only stop() is async.
      const safeClear = () => {
        try {
          instance.clear()
        } catch {
          // Already torn down — nothing to clean up.
        }
      }
      if (startedRef.current) {
        instance.stop().then(safeClear).catch(safeClear)
      } else {
        safeClear()
      }
    }
    // Camera is mounted once; `active` is handled by the effect below via pause/resume.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const instance = instanceRef.current
    if (!instance || !startedRef.current) return
    try {
      if (active) instance.resume()
      else instance.pause(true)
    } catch {
      // Pausing/resuming an already-transitioning scanner can throw; the next
      // state change will retry, so it's safe to swallow here.
    }
  }, [active])

  return <div id={QR_REGION_ID} className="[&_video]:rounded-2xl [&_video]:object-cover" />
}
