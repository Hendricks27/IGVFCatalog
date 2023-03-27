
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { geneNameSearchURLConstructor, geneLocationSearchURLConstructor, availableGenomeAndDataset } from "./API";
import {Empty, GenomeAssemblySelection, LocationSearchResult, LocationSearchResultContainer} from "./Module";

import loader from "./images/loader.gif"


function ListGeneName(props){

    const genomeAssembly = props.genomeAssembly

    const geneName = props.geneName;
    const setGeneName = props.setGeneName;

    const geneNameSelected = props.geneNameSelected;
    const setGeneNameSelected = props.setGeneNameSelected;


    const setInputStage = props.setInputStage;
    const setShowLoadingCircle = props.setShowLoadingCircle;

    const [geneNameOptions, setGeneNameOptions] = useState([]);

    const queryGeneName = function (){
        if (geneName.length >= 3 && !geneNameSelected){

            setShowLoadingCircle(true);
            axios.get(geneNameSearchURLConstructor(genomeAssembly, geneName))
                .then(function (response) {

                    setShowLoadingCircle(false);
                    if (response.data.length === 1){
                        if (response.data[0] === geneName){
                            setInputStage(2);
                        }
                    }
                    else {
                        setGeneNameOptions(response.data)
                    }

                })
                .catch(function (error) {
                    // console.log(geneName, error);
                });
        }
        else {
            setGeneNameOptions([]);
        }

    }

    useEffect(() => {
        queryGeneName();
    }, [geneName]);

    const geneOptionList = (
        <div className={"geneNameOptionsContainer"}>
            <li className={"geneNameOptions"}>
                {geneNameOptions.map((gn) => <ul onClick={ function (){
                    setGeneName(gn);
                    setInputStage(2);
                } }  className={"geneNameOption"}>{gn}</ul>)}
            </li>
        </div>
    )

    return <>{geneNameOptions.length === 0 ? "" : geneOptionList}</>

}


function ListGenePosition(props){

    const genomeAssembly = props.genomeAssembly
    const geneName = props.geneName;
    const geneNameSelected = props.geneNameSelected;

    const genomicLocation = props.genomicLocation;
    const setGenomicLocation = props.setGenomicLocation;

    const [genePositions, setGenePositions] = useState([]);

    const setInputStage = props.setInputStage;
    const setShowLoadingCircle = props.setShowLoadingCircle;

    const queryGeneLocation = function (){

        if (!geneNameSelected){

            setShowLoadingCircle(true);
            axios.get(geneLocationSearchURLConstructor(genomeAssembly, geneName))
                .then(function (response) {
                    setShowLoadingCircle(false);
                    setGenePositions(response.data)
                })
                .catch(function (error) {
                    // console.log(geneName, error);
                });


        }

    }

    useEffect(() => {
        queryGeneLocation();
    }, [geneName]);

    let txMin = 1000000000000000000000000
    let txMax = 0
    genePositions.map((gp) => {
        let exonStarts = gp.exonStarts.split(",");
        let exonEnds = gp.exonEnds.split(",");
        if (exonStarts[exonStarts.length-1] === ""){
            exonStarts.pop()
        }
        if (exonEnds[exonEnds.length-1] === ""){
            exonEnds.pop()
        }

        let everything = exonStarts.concat(exonEnds, [gp.txStart, gp.txEnd]);

        if (Math.min.apply(Math, everything) < txMin){txMin = Math.min.apply(Math, everything)}
        if (Math.max.apply(Math, everything) > txMax){txMax = Math.max.apply(Math, everything)}
    })

    const coord2hundred = (coord) => {
        const r = txMax - txMin;
        return (coord-txMin)/r
    }

    const genePositionList = (
        <div className={"genePositionContainer"}>
        <table>
            {genePositions.map((gp) => {

                let source = gp.collection;
                let coord = gp.chrom + ":" + gp.txStart + "-" + gp.txEnd;
                let description = gp.description;

                let strand = gp.strand;

                let exonStarts = gp.exonStarts.split(",");
                let exonEnds = gp.exonEnds.split(",");
                if (exonStarts[exonStarts.length-1] === ""){
                    exonStarts.pop()
                }
                if (exonEnds[exonEnds.length-1] === ""){
                    exonEnds.pop()
                }

                // scale(1 1) rotate()
                // x 0-200 y 0-60
                let svgWidth = 200;
                let svgHeight = 60;
                const toSVGX = (x) => {
                    return (x+0.03)*(svgWidth*0.94)
                }
                const ScaleSVGX = (x) => {
                    return x*(svgWidth*0.94)
                }
                const toSVGY = (y) => {
                    return (1-y)*svgHeight
                }
                const toSVGCoord = (x, y) => {
                    return [toSVGX(x), toSVGY(y)]
                }
                let svgColor = "blue";
                if (gp.transcriptionClass === "problem"){
                    svgColor = "red"
                } else if (gp.transcriptionClass === "protein_coding"){
                    svgColor = "blue"
                } else if (gp.transcriptionClass === "coding"){
                    svgColor = "blue"
                } else if (gp.transcriptionClass === "nonCoding"){
                    svgColor = "yellow"
                } else if (gp.transcriptionClass === ""){
                    svgColor = "yellow"
                } else if (gp.transcriptionClass === ""){
                    svgColor = "yellow"
                }

                const largestGap = [0, 0];
                let directionSVG = "";
                for (let i = 0; i < exonStarts.length-1; i++) {

                    let exonE = exonEnds[i];
                    let exonSNext = exonStarts[i+1];

                    if (exonSNext - exonE > largestGap[1] - largestGap[0]){
                        largestGap[0] = exonE;
                        largestGap[1] = exonSNext
                    }
                }

                let x1 = coord2hundred(largestGap[0]);
                let x2 = coord2hundred(largestGap[1]);
                let c = (x1+x2)/2;

                x1 = coord2hundred(gp.txEnd);
                x2 = coord2hundred(gp.txEnd)+0.03;
                if (strand === "+"){
                    x1 = coord2hundred(gp.txStart);
                    x2 = coord2hundred(gp.txStart)-0.03;
                }
                x1 = toSVGX(x1)
                x2 = toSVGX(x2)


                directionSVG =
                    <>
                        <line
                            x1={x1}
                            y1={toSVGY(0.5)}
                            x2={x2}
                            y2={toSVGY(0.6)}
                            stroke={svgColor}
                            stroke-width="1px"></line>
                        <line
                            x1={x1}
                            y1={toSVGY(0.5)}
                            x2={x2}
                            y2={toSVGY(0.4)}
                            stroke={svgColor}
                            stroke-width="1px"></line>
                    </>


                let geneRegionSVG = <svg
                    width={svgWidth.toString()+"px"}
                    height={svgHeight.toString()+"px"}
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                    <g transform={"translate(0 0)"}>
                        <line x1={toSVGX(coord2hundred(gp.txStart))} y1={toSVGY(0.5)} x2={toSVGX(coord2hundred(gp.txEnd))} y2={toSVGY(0.5)} stroke={svgColor} stroke-width="1px"></line>
                        <line x1={toSVGX(coord2hundred(gp.cdsStart))} y1={toSVGY(0.5)} x2={toSVGX(coord2hundred(gp.cdsEnd))} y2={toSVGY(0.5)} stroke={svgColor} stroke-width="3px"></line>
                        {
                            Object.keys(exonStarts).map((i) => {
                                let exonLength = exonEnds[i]-exonStarts[i];
                                let exonPixel = ScaleSVGX(exonLength / (txMax - txMin) ) // * 1.05
                                return <rect
                                    x={toSVGX(coord2hundred(exonStarts[i]))}
                                    y={toSVGY(0.65)}
                                    width={exonPixel}
                                    height={0.3*svgHeight}
                                    stroke={svgColor}
                                    fill={svgColor}
                                />
                            })
                        }{directionSVG}
                        }
                    </g>
                </svg>


                return <tr onClick={function (e) {
                    const loc = gp.chrom + ":" + gp.txStart + "-" + gp.txEnd;
                    setGenomicLocation(loc);
                    setInputStage(3);
                }} className={"genePositionRow"}>
                    <td>{source}<br />{coord}</td>
                    <td>{geneRegionSVG}</td>
                    <td style={{"fontSize": "10px"}}>{description}</td>
                </tr>
            })}
        </table>
        </div>
    )


    return <>{genePositions.length === 0 || geneNameSelected ? "" : genePositionList}</>
}




export function GeneSearch(props){

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?gene"
    )

    const [geneName, setGeneName] = useState("");

    const [genomicLocation, setGenomicLocation] = useState("chr1:1-10");


    const [availableDatasetByGenomeAssembly, setAvailableDatasetByGenomeAssembly] = useState(availableGenomeAndDataset);
    const [genomeAssembly, setGenomeAssembly] = useState("hg38");
    const [selectedDataset, setSelectedDataset] = useState({});

    // 0: Initial
    // 1: Text inputing
    // 2: Selected gene name
    // 3: Selected genomic location
    const [inputStage, setInputStage] = useState(0);
    const [showLoadingCircle, setShowLoadingCircle] = useState(false);



    return (
        <div>
            <h2 className={"pageTitle"}>Gene Search</h2>

            <div className={"contentContainerBorder"}>
                <p>Seach variation by gene name: </p>

                <GenomeAssemblySelection
                    genomeAssembly={genomeAssembly}
                    setGenomeAssembly={setGenomeAssembly}
                    availableDatasetByGenomeAssembly={availableDatasetByGenomeAssembly}
                    setAvailableDatasetByGenomeAssembly={setAvailableDatasetByGenomeAssembly}
                    selectedDataset={selectedDataset}
                    setSelectedDataset={setSelectedDataset}
                /><br />
                <form>
                    <label>Gene: </label>
                    <input
                        type={"text"}
                        value={geneName}
                        onChange={(e) => {
                            setGeneName(e.target.value);
                            setInputStage(1);
                        }}
                    />
                    {
                        [1, 2].includes(inputStage) && showLoadingCircle ? <img src={loader} alt={"xxx"} style={{width: "18px", margin: "auto"}}/> : <></>
                    }
                </form>
                {
                    inputStage === 1 ? <ListGeneName
                        genomeAssembly={genomeAssembly}
                        geneName={geneName}
                        setGeneName={setGeneName}

                        setInputStage={setInputStage}
                        setShowLoadingCircle={setShowLoadingCircle}
                    /> : <></>
                }
                {
                    inputStage === 2 ? <ListGenePosition
                        genomeAssembly={genomeAssembly}
                        geneName={geneName}
                        setInputStage={setInputStage}
                        setGenomicLocation={setGenomicLocation}
                        setShowLoadingCircle={setShowLoadingCircle}
                    /> : <></>
                }

            </div>

            {inputStage === 3 ? <LocationSearchResultContainer genomeAssembly={genomeAssembly} genomicLocation={genomicLocation} /> : <Empty /> }


        </div>
    )
}






