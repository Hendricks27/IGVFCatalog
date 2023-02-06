

import React, { useState, useContext, useEffect } from 'react';
import {BrowserRouter, Routes, Route, useSearchParams, useLocation} from "react-router-dom";

import {Empty, GenomeAssemblySelection} from "./Module";
import {GeneSearch} from "./GeneSearch"
import {LocationSearch} from "./LocationSearch"
// import EnhancedTable from "./Variant.tsx"
import VariantDetail from "./VariantDetail";
import Preset from "./Preset";

import './App.css';
import IGVFLogo from "./images/igvf.png";
import CardLogo from "./images/loader.gif";
import GeneSearchLogo from "./images/GeneSearchCard.jpeg";
import LocationSearchLogo from "./images/LocationSearchCard.jpeg";

import {GitHubSVG, LocationSVG, AboutSVG, VariantSVG, GeneSVG} from "./SVGLogo";


import D3Element from "./D3Test";
import {Table1ComplicateTest, Table1Test} from "./ReusableElements"
import {Tab} from "@mui/material";

const pageTypeContext = React.createContext(null);


/*
* TODO
    * 2. Gene Search Location Visualization
    * 3. Lollipop Graph
    *
* */



function Header(props){

    const { pageType, setPageType } = useContext(pageTypeContext);
    // <a className={"navbarElementHome navbarElementA"}>IGVF Catalog</a>

    return <li className={"navbar"}>
        <ul
            className={"navbarElement"}
            onClick={() => setPageType("home")}>
            <img src={IGVFLogo} alt={"123"} width={138} ></img>

        </ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("geneSearch")}} ><GeneSVG></GeneSVG> <span className={"headerText"}>Gene Search</span></a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("locSearch")}} ><LocationSVG></LocationSVG> <span className={"headerText"}>Location Search</span></a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("variantID")}} ><VariantSVG></VariantSVG> <span className={"headerText"}>Variant</span></a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("about")}} ><AboutSVG></AboutSVG> <span className={"headerText"}>About</span></a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} href={"https://github.com/Hendricks27/IGVFCatalog/issues"} target={"_blank"}><GitHubSVG></GitHubSVG> <span className={"headerText"}>Contact</span></a></ul>
    </li>
}


function FooterOLD(props){
    return <li  className={"footer"}>
        <ul className={"footerElement"}><a className={"footerElementA"}>Link 0</a></ul>
        <ul className={"footerElement"}><a className={"footerElementA"}>Link 1</a></ul>
        <ul className={"footerElement"}><a className={"footerElementA"}>Link 2</a></ul>
        <ul className={"footerElement"}><a className={"footerElementA"}>Link 3</a></ul>
        <ul className={"footerElement"}><a className={"footerElementA"}>Link 4</a></ul>
    </li>
}

function Footer(props){
    return <div className={"footer"}>
        <span>Copyright© 2022-2023 Washington University in St. Louis. All rights reserved.</span><br />
        <span>Developed by the <a href={"https://wang.wustl.edu/"} target="_blank">Wang Lab</a></span><br />
        <span>Terms and Conditions of Use</span>
    </div>
}

function Card(props){

    const { pageType, setPageType } = useContext(pageTypeContext);

    return <div className={"card"} onClick={() => setPageType(props.pageType)}>
        <h2 style={{margin: "10px"}}>{props.title}</h2>
        <div style={{border: "1px solid lightgrey", height: 0}}></div>
        <p>{props.description}</p>
        <img src={props.imageURL} alt="texxxx" width={300} height={300} />
    </div>
}

function HomePageContent(props){

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?home"
    )

    const cardsData = [];
    cardsData.push({
        "title": "Gene Search",
        "pageType": "geneSearch",
        "description": "Search by Gene Name",
        "imageURL": GeneSearchLogo
    })
    cardsData.push({
        "title": "Location Search",
        "pageType": "locSearch",
        "description": "Search by chromosome and location",
        "imageURL": LocationSearchLogo
    })
    cardsData.push({
        "title": "Variant Search",
        "pageType": "variantID",
        "description": "Search variant by ID",
        "imageURL": GeneSearchLogo
    })
    cardsData.push({
        "title": "Presets",
        "pageType": "preset",
        "description": "Preset search result for viewing",
        "imageURL": LocationSearchLogo
    })



    return <div> {cardsData.map((card) => Card(card))} </div>

}


function About(props){

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?about"
    )

    return <>
         Under construction...
    </>
}

function Placeholder(props){
    return <>
        Empty Page
    </>
}





function IGVFMainPage(props) {

    const [searchParams, setSearchParams] = useSearchParams();

    let pttmp = "home"
    if (searchParams.get('variantID') != null){
        pttmp ="variantID";
    }
    else if (searchParams.get('location') != null){
        pttmp ="locSearch";
    }
    else if (searchParams.get('preset') != null){
        pttmp ="preset";
    }
    else if (searchParams.get('home') != null){
        pttmp ="home";
    }
    else if (searchParams.get('about') != null){
        pttmp ="about";
    }
    else if (searchParams.get('test') != null){
        pttmp ="test";
    }

    const [pageType, setPageType] = useState(pttmp);

    return (
        <pageTypeContext.Provider value={{pageType, setPageType}}>
            <div className="App" style={{width: "100%", height: "100vh", overflow: "auto"}}>

                <Header />

                {
                    (() => {
                        let ele = <HomePageContent />;
                        switch(pageType) {

                            case "home":
                                ele = <HomePageContent urlParams={searchParams} />
                                break;
                            case "geneSearch":
                                ele = <GeneSearch urlParams={searchParams}/>
                                break;
                            case "locSearch":
                                ele = <LocationSearch urlParams={searchParams}/>
                                break;
                            case "variantID":
                                ele = <VariantDetail urlParams={searchParams}/>
                                break;
                            case "about":
                                ele = <About urlParams={searchParams} />
                                break;
                            case "preset":
                                ele = <Preset urlParams={searchParams} />
                                break;
                            case "placeholder":
                                ele = <Placeholder />
                                break;
                            case "test":
                                ele = <TestPage urlParams={searchParams} />
                                break;
                            default:
                                ele = <HomePageContent urlParams={searchParams}/>

                        }
                        return ele
                    })()
                }


                <Footer />

            </div>
        </pageTypeContext.Provider>
  );
}



function TestPage(props){

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?test"
    )

    return <Table1ComplicateTest></Table1ComplicateTest>
}



export default IGVFMainPage;



