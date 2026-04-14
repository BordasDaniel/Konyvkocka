import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import NewsletterModal from '../common/NewsletterModal'

type LayoutProps = {
	children: React.ReactNode
}

function Layout({ children }: LayoutProps) {
	return (
		<>
			<Navbar />
			<div className="page-content">
				{children}
			</div>
			<Footer />
			<NewsletterModal />
		</>
	)
}

export default Layout
