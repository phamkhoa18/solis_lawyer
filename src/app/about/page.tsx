import React, { } from 'react'
import PageTitle from '../components/PageTitle'
import Header from '../common/Header'
import About from '../components/About'
import Team from '../components/Team'
import Footer from '../common/Footer'

export default function AboutPage() {
    return (
    <>
    <Header></Header>
    <section className='about'>
        <PageTitle
            title="About Us"
            backgroundImage="/images/bgbanner/page-title-bg.jpg"
            breadcrumb={[
            { label: 'Home', href: '/' },
            { label: 'Projects' },
            ]}
        />

        <About></About>
        <Team></Team>
    </section>
    <Footer></Footer>
    </>
    )
}
