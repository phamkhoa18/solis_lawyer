'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Cấu hình thanh NProgress
NProgress.configure({ showSpinner: false })

export default function NProgressProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams() ?? '' ;
  const previousUrl = useRef(`${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`)

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a') as HTMLAnchorElement | null

      if (anchor?.href && anchor.origin === location.origin) {
        const newUrl = new URL(anchor.href)
        const newFullPath = `${newUrl.pathname}${newUrl.search}`

        // Kiểm tra sự thay đổi của cả pathname và query parameter
        if (newFullPath !== `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`) {
          NProgress.start()
        }
      }
    }

    window.addEventListener('click', handleLinkClick)
    return () => window.removeEventListener('click', handleLinkClick)
  }, [pathname, searchParams])

  useEffect(() => {
    const currentUrl = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`
    
    // Hoàn thành NProgress khi URL thay đổi (bao gồm cả query parameter)
    if (previousUrl.current !== currentUrl) {
      NProgress.done()
      previousUrl.current = currentUrl
    }
  }, [pathname, searchParams])

  return null
}