'use client'
import Link from 'next/link'
import { Zap, Facebook, Youtube, Phone, Mail, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ShopFooter() {
  const { t } = useTranslation()
  
  return (
    <footer className="bg-gray-900 text-gray-300 pt-12 pb-6">
      <div className="page-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-gray-800">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-lg">TechShop</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {t('footer.brandDesc')}
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-primary-600 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-red-600 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.products')}</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: t('footer.phones'), href: '/products' },
                { label: t('footer.laptops'), href: '/products' },
                { label: t('footer.tablets'), href: '/products' },
                { label: t('footer.accessories'), href: '/products' },
                { label: t('footer.audio'), href: '/products' },
                { label: t('footer.smartwatch'), href: '/products' }
              ].map((item) => (
                <li key={item.label}><Link href={item.href} className="hover:text-white transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm">
              {[
                t('footer.buyGuide'),
                t('footer.returnPolicy'),
                t('footer.warranty'),
                t('footer.shipping'),
                t('footer.faq')
              ].map((item) => (
                <li key={item}><a href="#" className="hover:text-white transition-colors">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" /><span>123 Đường Láng, Đống Đa, Hà Nội</span></li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary-400" /><a href="tel:1900xxxx" className="hover:text-white">1900 1234</a></li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary-400" /><a href="mailto:hello@techshop.vn" className="hover:text-white">hello@techshop.vn</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs text-gray-500">
          <p>{t('common.allRightsReserved')}</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-300">{t('common.terms')}</a>
            <a href="#" className="hover:text-gray-300">{t('common.privacy')}</a>
            <a href="#" className="hover:text-gray-300">{t('common.cookie')}</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
