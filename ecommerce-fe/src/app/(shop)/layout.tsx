// src/app/(shop)/layout.tsx
import ShopNavbar from '@/components/layout/ShopNavbar'
import ShopFooter from '@/components/layout/ShopFooter'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ShopNavbar />
      <main className="flex-1">{children}</main>
      <ShopFooter />
    </div>
  )
}
