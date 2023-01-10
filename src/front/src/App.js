

import React, { useState, useContext, useEffect } from 'react';
import {BrowserRouter, Routes, Route, useSearchParams} from "react-router-dom";

import {Empty, GenomeAssemblySelection} from "./Module";
import {GeneSearch} from "./GeneSearch"
import {LocationSearch} from "./LocationSearch"
// import EnhancedTable from "./Variant.tsx"
import VariantDetail from "./VariantDetail";

import './App.css';
import CardLogo from "./images/loader.gif";
import GeneSearchLogo from "./images/GeneSearchCard.jpeg";
import LocationSearchLogo from "./images/LocationSearchCard.jpeg";

import D3Element from "./D3Test";


const pageTypeContext = React.createContext(null);


/*
* TODO
    * 2. Gene Search Location Visualization
    * 3. Lollipop Graph
    *
* */



function Header(props){

    const { pageType, setPageType } = useContext(pageTypeContext);

    return <li className={"navbar"}>
        <ul
            className={"navbarElement"}
            onClick={() => setPageType("home")}>
        <a className={"navbarElementHome navbarElementA"}>IGVF Catalog</a>
        </ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("geneSearch")}} >Gene Search</a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("locSearch")}} >Location Search</a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("variantID")}} >Variant</a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} onClick={() => {setPageType("about")}} >About</a></ul>
            <ul className={"navbarElement"}><a className={"navbarElementA"} href={"https://github.com/Hendricks27/IGVFCatalog/issues"} target={"_blank"}>Contact</a></ul>
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
        "imageURL": CardLogo
    })
    cardsData.push({
        "title": "Presets",
        "pageType": "preset",
        "description": "Preset search result for viewing",
        "imageURL": GeneSearchLogo
    })



    return <div> {cardsData.map((card) => Card(card))} </div>

}


function About(props){
    return <>
        Nothing here...
    </>
}

function Placeholder(props){
    return <>
        Empty Page
    </>
}



function IGVFPageManager(props){

    return <BrowserRouter>
        <Routes>
            <Route path="/" element={<IGVFMainPage />}></Route>
        </Routes>
    </BrowserRouter>
}

function IGVFMainPage(props) {

    // TODO replace by route manager
    let pttmp = "home"
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('variantID') != null){
        pttmp ="variantID";
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
                                ele = <HomePageContent urlParams={urlParams} />
                                break;
                            case "geneSearch":
                                ele = <GeneSearch urlParams={urlParams}/>
                                break;
                            case "locSearch":
                                ele = <LocationSearch urlParams={urlParams}/>
                                break;
                            case "variantID":
                                ele = <VariantDetail urlParams={urlParams}/>
                                break;
                            case "about":
                                ele = <About />
                                break;
                            case "preset":
                                ele = <PresetPage />
                                break;
                            case "placeholder":
                                ele = <Placeholder />
                                break;
                            default:
                                ele = <HomePageContent />

                        }
                        return ele
                    })()
                }


                <Footer />

            </div>
        </pageTypeContext.Provider>
  );
}


function PresetPage(props){
    let abc = ["dasda", "dadas", "dhsajkl", ];
    return <>
        Empty Page for now.
        <D3Element></D3Element>
    </>
}



export default IGVFMainPage;



