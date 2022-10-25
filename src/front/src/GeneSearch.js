
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { geneNameSearchURLConstructor, geneLocationSearchURLConstructor, availableGenomeAndDataset } from "./API";
import { Empty, GenomeAssemblySelection, LocationSearchResult } from "./Module";

import loader from "./images/loader.gif"


function ListGeneName(props){

    const genomeAssembly = props.genomeAssembly

    const geneName = props.geneName;
    const setGeneName = props.setGeneName;

    const geneNameSelected = props.geneNameSelected;
    const setGeneNameSelected = props.setGeneNameSelected;

    const genomicLocation = props.genomicLocation;
    const setGenomicLocation = props.setGenomicLocation;

    const [geneNameOptions, setGeneNameOptions] = useState([]);

    const queryGeneName = function (){
        if (geneName.length >= 3 && !geneNameSelected){
            axios.get(geneNameSearchURLConstructor(genomeAssembly, geneName))
                .then(function (response) {
                    setGeneNameOptions(response.data)
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
                    setGeneNameOptions([]);
                    setGeneNameSelected(true);
                    setGenomicLocation("");
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

    const queryGeneLocation = function (){
        if (!geneNameSelected){

            axios.get(geneLocationSearchURLConstructor(genomeAssembly, geneName))
                .then(function (response) {
                    // console.log(genomeAssembly, geneName, response.data);
                    /* each in list looks like:
                    chrom: "chr17"
                    cdsEnd: 43106526
                    cdsStart: 43045677
                    collection: "refGene"
                    description: "Gene Type: protein_coding Transcript Type: protein_coding Additional Info: Homo sapiens breast cancer 1 (BRCA1), transcript variant 3, mRNA. (from RefSeq NM_007297)"
                    exonEnds: "43045802,43047703,43049194,43051117,43057135,43063373,43063951,43067695,43071238,43074521,43076614,43082575,43091032,43094860,43095922,43097289,43099880,43104261,43104956,43106533,43124115,43125451"
                    exonStarts: "43044294,43047642,43049120,43051062,43057051,43063332,43063873,43067607,43070927,43074330,43076487,43082403,43090943,43091434,43095845,43097243,43099774,43104121,43104867,43106455,43124016,43125276"
                    id: "NM_007297"
                    name: "BRCA1"
                    strand: "-"
                    transcriptionClass: "coding"
                    txEnd: 43125451
                    txStart: 43044294
                    * */
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

    const genePositionListOLD = (
        <li className={"geneNameOptions"}>
            {genePositions.map((gp) => <ul onClick={ function (e){
                const loc = gp.chrom +":"+ gp.cdsStart +"-"+ gp.cdsEnd;
                setGenomicLocation(loc);
                setGenePositions([]);
            }}  className={"geneNameOption"}>{gp.chrom +":"+ gp.cdsStart +"-"+ gp.cdsEnd}</ul>)}
        </li>
    )

    let cdsMin = 1000000000000000000000000
    let cdsMax = 0
    genePositions.map((gp) => {
        let exonStarts = gp.exonStarts.split(",");
        let exonEnds = gp.exonEnds.split(",");
        if (exonStarts[exonStarts.length-1] === ""){
            exonStarts.pop()
        }
        if (exonEnds[exonEnds.length-1] === ""){
            exonEnds.pop()
        }

        let everything = exonStarts.concat(exonEnds, [gp.cdsStart, gp.cdsEnd]);

        if (Math.min.apply(Math, everything) < cdsMin){cdsMin = Math.min.apply(Math, everything)}
        if (Math.max.apply(Math, everything) > cdsMax){cdsMax = Math.max.apply(Math, everything)}
    })

    const coord2hundred = (coord) => {
        const r = cdsMax - cdsMin;
        return (coord-cdsMin)/r
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
                console.log(gp.transcriptionClass)
                const toSVGX = (x) => {
                    return x*svgWidth
                }
                const toSVGY = (y) => {
                    return (1-y)*svgHeight
                }
                const toSVGCoord = (x, y) => {
                    return [toSVGX(x), toSVGY(y)]
                }
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
                                let exonPixel = exonLength / (cdsMax - cdsMin) * svgWidth * 1.05
                                return <rect
                                    x={toSVGX(coord2hundred(exonStarts[i]))}
                                    y={toSVGY(0.65)}
                                    width={exonPixel}
                                    height={0.3*svgHeight}
                                    stroke={svgColor}
                                    fill={svgColor}
                                />
                            })
                        }
                    </g>
                </svg>


                return <tr onClick={function (e) {
                    const loc = gp.chrom + ":" + gp.txStart + "-" + gp.txEnd;
                    setGenomicLocation(loc);
                    setGenePositions([]);
                }} className={"genePositionRow"}>
                    <td>{source}<br />{coord + "(" + strand + ")"}</td>
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

    const [geneName, setGeneName] = useState("");
    const [geneNameSelected, setGeneNameSelected] = useState(false);

    const [genomicLocation, setGenomicLocation] = useState("");

    const [availableDatasetByGenomeAssembly, setAvailableDatasetByGenomeAssembly] = useState(availableGenomeAndDataset);
    const [genomeAssembly, setGenomeAssembly] = useState("hg38");
    const [selectedDataset, setSelectedDataset] = useState({});

    return (
        <div>
            <h2 className={"pageTitle"}>Gene Search</h2>

            <div className={"searchContainer"}>
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
                        onChange={(e) => {setGeneName(e.target.value);setGeneNameSelected(false)}}
                    />
                    {geneNameSelected && genomicLocation !== "" ? <Empty /> : <img src={loader} alt={"xxx"} style={{width: "18px", margin: "auto"}}/>}
                </form>
                <ListGeneName
                    genomeAssembly={genomeAssembly}
                    geneName={geneName}
                    setGeneName={setGeneName}
                    geneNameSelected={geneNameSelected}
                    setGeneNameSelected={setGeneNameSelected}
                    genomicLocation={genomicLocation}
                    setGenomicLocation={setGenomicLocation}
                />
                <ListGenePosition
                    genomeAssembly={genomeAssembly}
                    geneName={geneName}
                    setGeneName={setGeneName}
                    genomicLocation={genomicLocation}
                    setGenomicLocation={setGenomicLocation}
                />

            </div>
            <div className={"resultContainer"}>
                {genomicLocation === "" ? <></> : <LocationSearchResult genomeAssembly={genomeAssembly} genomicLocation={genomicLocation} /> }
            </div>

        </div>
    )
}






