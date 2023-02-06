
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {geneNameSearchURLConstructor} from "./API";
import {Table1} from "./ReusableElements"


export function GenePreset(){

    const tableData = {
        "caption": "Highlighted Genes",
        "header": ["Gene", "IGVF Link", "Description"],
        "rows": [],
    }

    const option = {
        "sortable": true,
        "rowPerPage": 100,
        "download": false,
    };


    const data = [
        ["Gene 1", "https://catalog-dev.igvf.org/?location=chrX:100000-1000000", "This is a fake gene."],
        ["Gene 2", "https://catalog-dev.igvf.org/?location=chrX:2000000-3000000", "This is a fake gene."],
        ["Gene 3", "https://catalog-dev.igvf.org/?location=chrX:3000000-4000000", "This is a fake gene."],
        ["Gene 4", "https://catalog-dev.igvf.org/?location=chrX:4000000-5000000", "This is a fake gene."],
        ["Gene 5", "https://catalog-dev.igvf.org/?location=chrX:5000000-6000000", "This is a fake gene."],
    ]

    for (let d0 of data){
        let row = [];

        for (let colNum in d0){
            let cell = {
                "content": d0[colNum],
                "sortKey": d0[colNum],
            }

            if (colNum == 1){
                cell.content = <a href={d0[colNum]} target={"_blank"}>Click me!</a>
            }
            row.push(cell)
        }

        tableData.rows.push(row)
    }

    return <div className={"searchContainer"}>
        <Table1 tableData={tableData} option={option}></Table1>
    </div>
}



export function VariationPreset(){


    const tableData = {
        "caption": "Highlighted Variations",
        "header": ["dbSNP", "IGVF Link", "Description"],
        "rows": [],
    }

    const option = {
        "sortable": true,
        "rowPerPage": 10,
        "download": false,
    };



    let ids = [
        "rs201556012", "rs151073358", "rs766889075", "rs3747333", "rs368558765", "rs182291106", "rs199538596",
        "rs190872190", "rs763524990", "rs113313554", "rs532052827", "rs771777084", "rs151147105",
    ]

    for (let rsid of ids){
        let row = [];

        row.push({
            "content": <a href={"https://www.ncbi.nlm.nih.gov/snp/?term=" + rsid} target={"_blank"}>{rsid}</a>,
            "sortKey": rsid,
        })

        row.push({
            "content": <a href={"https://catalog-dev.igvf.org/?variantID=" + rsid} target={"_blank"}>Click me!</a>,
            "sortKey": rsid,
        })

        row.push({
            "content": "Some random dbSNP...",
            "sortKey": "Some random dbSNP...",
        })

        tableData.rows.push(row)
    }

    return <div className={"searchContainer"}>
        <Table1 tableData={tableData} option={option}></Table1>
    </div>
}


export function OtherPreset(){

    const tableData = {
        "caption": "Feature Rich Content",
        "header": ["IGVF Link", "Description"],
        "rows": [],
    }

    const option = {
        "sortable": true,
        "rowPerPage": 10,
        "download": false,
    };

    let data = [
        ["https://catalog-dev.igvf.org/?location=chrX:1-3000000", "Colorful 1000 Genome Graphs"],
        ["https://catalog-dev.igvf.org/?location=chr1:167050000-167060000", "Colorful Favor Graphs"],
        ["https://catalog-dev.igvf.org/?location=chr22:1-100000000", "With Favor Data"],
    ]

    for (let d0 of data){
        // d0[0] = <a href={d0[0]} target={"_blank"}>Click me!</a>
        let row = [];
        for (let colNum in d0){
            let cell = {
                "content": d0[colNum],
                "sortKey": d0[colNum],
            }

            if (colNum == 0){
                cell.content = <a href={d0[colNum]} target={"_blank"}>Click me!</a>
            }
            row.push(cell)
        }
        tableData.rows.push(row)

    }


    return <div className={"searchContainer"}>
        <Table1 tableData={tableData} option={option}></Table1>
    </div>
}



export default function Preset(props){

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?preset"
    )

    return <>
        <GenePreset></GenePreset>
        <VariationPreset></VariationPreset>
        <OtherPreset></OtherPreset>
        <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
    </>
}



