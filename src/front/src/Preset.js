
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import {geneNameSearchURLConstructor} from "./API";
import {Table1} from "./ReusableElements"


export function GenePreset(){
    let caption = "Highlighted Genes";
    let header = ["Gene", "IGVF Link", "Description"];
    let data = [];
    let option = {};

    data = [
        ["Gene 1", "https://catalog-dev.igvf.org/?location=chrX:100000-1000000", "This is a fake gene."],
        ["Gene 2", "https://catalog-dev.igvf.org/?location=chrX:2000000-3000000", "This is a fake gene."],
        ["Gene 3", "https://catalog-dev.igvf.org/?location=chrX:3000000-4000000", "This is a fake gene."],
        ["Gene 4", "https://catalog-dev.igvf.org/?location=chrX:4000000-5000000", "This is a fake gene."],
        ["Gene 5", "https://catalog-dev.igvf.org/?location=chrX:5000000-6000000", "This is a fake gene."],
    ]

    for (let d0 of data){
        d0[1] = <a href={d0[1]} target={"_blank"}>Click me!</a>
    }

    let d = [caption, header, data, option];

    return <div className={"searchContainer"}>
        <Table1 data={d}></Table1>
    </div>
}



export function VariationPreset(){
    let caption = "Highlighted Variations";
    let header = ["dbSNP", "IGVF Link", "Description"];
    let data = [];
    let option = {};

    let ids = [
        "rs201556012", "rs151073358", "rs766889075", "rs3747333", "rs368558765", "rs182291106", "rs199538596",
        "rs190872190", "rs763524990", "rs113313554", "rs532052827", "rs771777084", "rs151147105",
    ]

    for (let rsid of ids){
        let d0 = [];

        d0.push(<a href={"https://www.ncbi.nlm.nih.gov/snp/?term=" + rsid} target={"_blank"}>{rsid}</a>)
        d0.push(<a href={"https://catalog-dev.igvf.org/?variantID=" + rsid} target={"_blank"}>Click me!</a>)
        d0.push("Some random dbSNP...")

        data.push(d0)
    }

    let d = [caption, header, data, option];

    return <div className={"searchContainer"}>
        <Table1 data={d}></Table1>
    </div>
}


export function OtherPreset(){
    let caption = "Feature Rich Content";
    let header = ["IGVF Link", "Description"];
    let data = [];
    let option = {};

    data = [
        ["https://catalog-dev.igvf.org/?location=chrX:1-3000000", "Colorful 1000 Genome Graphs"],
        ["https://catalog-dev.igvf.org/?location=chr22:1-100000000", "With Favor Data"],
        ["https://catalog-dev.igvf.org/?location=chrX:100000-1000000", "Pretend I had the third row"],
    ]

    for (let d0 of data){
        d0[0] = <a href={d0[0]} target={"_blank"}>Click me!</a>
    }

    let d = [caption, header, data, option];

    return <div className={"searchContainer"}>
        <Table1 data={d}></Table1>
    </div>
}



export default function Preset(props){

    return <>
        <GenePreset></GenePreset>
        <VariationPreset></VariationPreset>
        <OtherPreset></OtherPreset>
        <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
    </>
}



