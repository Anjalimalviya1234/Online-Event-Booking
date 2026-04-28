import Navbar from '../../components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedVenues from './components/FeaturedVenues';
import TrendingVenues from './components/TrendingVenues';
import BestForWeddings from './components/BestForWeddings';
import BudgetFriendly from './components/BudgetFriendly';
import PremiumResorts from './components/PremiumResorts';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CTASection from './components/CTASection';
import Footer from '../../components/Footer';

export default function Home() {
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <Categories />
                <FeaturedVenues />
                <TrendingVenues />
                <BestForWeddings />
                <BudgetFriendly />
                <PremiumResorts />
                <HowItWorks />
                <Testimonials />
                <CTASection />
            </main>
            <Footer />
        </>
    );
}
