import Layout from "./Layout.jsx";

import Game from "./Game";

import Leaderboard from "./Leaderboard";

import Settings from "./Settings";

import Shop from "./Shop";

import BuyMilk from "./BuyMilk";

import Tutorial from "./Tutorial";

import ShowRoom from "./ShowRoom";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Game: Game,
    
    Leaderboard: Leaderboard,
    
    Settings: Settings,
    
    Shop: Shop,
    
    BuyMilk: BuyMilk,
    
    Tutorial: Tutorial,
    
    ShowRoom: ShowRoom,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Game />} />
                
                
                <Route path="/Game" element={<Game />} />
                
                <Route path="/Leaderboard" element={<Leaderboard />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Shop" element={<Shop />} />
                
                <Route path="/BuyMilk" element={<BuyMilk />} />
                
                <Route path="/Tutorial" element={<Tutorial />} />
                
                <Route path="/ShowRoom" element={<ShowRoom />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}