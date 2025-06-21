'use client'

import { Suspense } from 'react'
import NProgressProvider from './NProgressProvider'

export default function NProgressWrapper() {
  return (
    <Suspense fallback={null}>
      <NProgressProvider />
    </Suspense>
  )
}
