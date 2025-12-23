import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

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
		</>
	)
}

export default Layout
