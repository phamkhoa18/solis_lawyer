import React, { } from 'react'
import Banner from './Banner'
import Services from './Services'
import About from './About'
import Team from './Team'
import Testimonial from './Testimonial'
import CaseStudy from './CaseStudy'

export default function Home() {
    return (
      <>
      <Banner></Banner>
      <About></About>
      <Services></Services>
      <Testimonial></Testimonial>
      <Team></Team>
      <CaseStudy></CaseStudy>
      </>
    )
}
