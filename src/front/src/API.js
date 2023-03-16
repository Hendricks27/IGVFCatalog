
import axios from "axios";
import React, { useState, useContext, useEffect } from 'react';
import * as pako from "pako";

export const availableGenomeAndDataset = {
    "hg19": [],
    "hg38": [],
    "chm13": [],
}

export const pseudoVariationResultFake1 = [{"chr": "chr17", "startPos": 240291, "endPos": 240292, "source": "GnomAD", "conversion": "T>A", "variantType": "SNV", "description": "", "dbSNPID": "1101618"}, {"chr": "chr17", "startPos": 294507, "endPos": 294508, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "1599601"}, {"chr": "chr17", "startPos": 269203, "endPos": 269207, "source": "dbSNP", "conversion": "GTTT", "variantType": "insertion", "description": "", "dbSNPID": "9329644"}, {"chr": "chr17", "startPos": 235337, "endPos": 235343, "source": "GnomAD", "conversion": "GACCGG", "variantType": "insertion", "description": "", "dbSNPID": "2125773"}, {"chr": "chr17", "startPos": 268040, "endPos": 268041, "source": "dbSNP", "conversion": "G>C", "variantType": "SNV", "description": "", "dbSNPID": "7361562"}, {"chr": "chr17", "startPos": 233793, "endPos": 233801, "source": "dbSNP", "conversion": "CCCAGGAA", "variantType": "insertion", "description": "", "dbSNPID": "4230683"}, {"chr": "chr17", "startPos": 240583, "endPos": 240590, "source": "GnomAD", "conversion": "GTTTATC", "variantType": "insertion", "description": "", "dbSNPID": "8970100"}, {"chr": "chr17", "startPos": 285812, "endPos": 285813, "source": "GnomAD", "conversion": "T>T", "variantType": "SNV", "description": "", "dbSNPID": "492354"}, {"chr": "chr17", "startPos": 288926, "endPos": 288927, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "3863789"}, {"chr": "chr17", "startPos": 296178, "endPos": 296179, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "857120"}, {"chr": "chr17", "startPos": 223232, "endPos": 223233, "source": "GnomAD", "conversion": "C>T", "variantType": "SNP", "description": "", "dbSNPID": "8907527"}, {"chr": "chr17", "startPos": 259275, "endPos": 259283, "source": "GnomAD", "conversion": "TTTGGTTG", "variantType": "insertion", "description": "", "dbSNPID": "4159997"}, {"chr": "chr17", "startPos": 218548, "endPos": 218549, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "6319208"}, {"chr": "chr17", "startPos": 259533, "endPos": 259543, "source": "GnomAD", "conversion": "AACCCGCACT", "variantType": "insertion", "description": "", "dbSNPID": "9428440"}, {"chr": "chr17", "startPos": 296926, "endPos": 296927, "source": "GnomAD", "conversion": "C>G", "variantType": "SNV", "description": "", "dbSNPID": "3554248"}, {"chr": "chr17", "startPos": 217235, "endPos": 217236, "source": "dbSNP", "conversion": "C>C", "variantType": "SNP", "description": "", "dbSNPID": "5644797"}, {"chr": "chr17", "startPos": 268569, "endPos": 268570, "source": "dbSNP", "conversion": "A", "variantType": "insertion", "description": "", "dbSNPID": "4103554"}, {"chr": "chr17", "startPos": 201685, "endPos": 201686, "source": "dbSNP", "conversion": "A>A", "variantType": "SNP", "description": "", "dbSNPID": "1658928"}, {"chr": "chr17", "startPos": 228092, "endPos": 228093, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "9081628"}, {"chr": "chr17", "startPos": 242441, "endPos": 242442, "source": "ClinVar", "conversion": "T>A", "variantType": "SNP", "description": "", "dbSNPID": "5149525"}, {"chr": "chr17", "startPos": 282065, "endPos": 282066, "source": "ClinVar", "conversion": "C>G", "variantType": "SNP", "description": "", "dbSNPID": "8105853"}, {"chr": "chr17", "startPos": 291491, "endPos": 291492, "source": "ClinVar", "conversion": "C>C", "variantType": "SNP", "description": "", "dbSNPID": "522275"}, {"chr": "chr17", "startPos": 241156, "endPos": 241158, "source": "ClinVar", "conversion": "CA", "variantType": "insertion", "description": "", "dbSNPID": "8192562"}, {"chr": "chr17", "startPos": 299798, "endPos": 299799, "source": "ClinVar", "conversion": "G>G", "variantType": "SNV", "description": "", "dbSNPID": "3885444"}, {"chr": "chr17", "startPos": 270818, "endPos": 270819, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "542842"}, {"chr": "chr17", "startPos": 290769, "endPos": 290770, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "9318764"}, {"chr": "chr17", "startPos": 270543, "endPos": 270544, "source": "GnomAD", "conversion": "G>C", "variantType": "SNV", "description": "", "dbSNPID": "3618183"}, {"chr": "chr17", "startPos": 243840, "endPos": 243841, "source": "ClinVar", "conversion": "G>A", "variantType": "SNV", "description": "", "dbSNPID": "327026"}, {"chr": "chr17", "startPos": 269305, "endPos": 269306, "source": "GnomAD", "conversion": "C>T", "variantType": "SNP", "description": "", "dbSNPID": "457925"}, {"chr": "chr17", "startPos": 251113, "endPos": 251114, "source": "ClinVar", "conversion": "T>A", "variantType": "SNP", "description": "", "dbSNPID": "4297421"}, {"chr": "chr17", "startPos": 272970, "endPos": 272971, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "9333507"}, {"chr": "chr17", "startPos": 250891, "endPos": 250892, "source": "GnomAD", "conversion": "C>G", "variantType": "SNV", "description": "", "dbSNPID": "2282984"}, {"chr": "chr17", "startPos": 200079, "endPos": 200082, "source": "ClinVar", "conversion": "GGT", "variantType": "insertion", "description": "", "dbSNPID": "7446099"}, {"chr": "chr17", "startPos": 226827, "endPos": 226832, "source": "ClinVar", "conversion": "GCGAC", "variantType": "insertion", "description": "", "dbSNPID": "4865428"}, {"chr": "chr17", "startPos": 268606, "endPos": 268607, "source": "dbSNP", "conversion": "T>T", "variantType": "SNV", "description": "", "dbSNPID": "1471339"}, {"chr": "chr17", "startPos": 290659, "endPos": 290660, "source": "GnomAD", "conversion": "G>A", "variantType": "SNP", "description": "", "dbSNPID": "1831520"}, {"chr": "chr17", "startPos": 267207, "endPos": 267208, "source": "dbSNP", "conversion": "C>T", "variantType": "SNV", "description": "", "dbSNPID": "5204515"}, {"chr": "chr17", "startPos": 270874, "endPos": 270883, "source": "dbSNP", "conversion": "TCTGAGTTC", "variantType": "insertion", "description": "", "dbSNPID": "7221485"}, {"chr": "chr17", "startPos": 210368, "endPos": 210369, "source": "ClinVar", "conversion": "A>T", "variantType": "SNV", "description": "", "dbSNPID": "5483655"}, {"chr": "chr17", "startPos": 261290, "endPos": 261291, "source": "dbSNP", "conversion": "G>G", "variantType": "SNV", "description": "", "dbSNPID": "2084487"}, {"chr": "chr17", "startPos": 236980, "endPos": 236989, "source": "ClinVar", "conversion": "AAGGACCAG", "variantType": "insertion", "description": "", "dbSNPID": "7635195"}, {"chr": "chr17", "startPos": 203191, "endPos": 203192, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "9386648"}, {"chr": "chr17", "startPos": 240146, "endPos": 240147, "source": "GnomAD", "conversion": "G>C", "variantType": "SNV", "description": "", "dbSNPID": "4187317"}, {"chr": "chr17", "startPos": 229266, "endPos": 229270, "source": "GnomAD", "conversion": "CGAG", "variantType": "insertion", "description": "", "dbSNPID": "8482193"}, {"chr": "chr17", "startPos": 233607, "endPos": 233608, "source": "ClinVar", "conversion": "A>G", "variantType": "SNV", "description": "", "dbSNPID": "1337608"}, {"chr": "chr17", "startPos": 298051, "endPos": 298052, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "1450893"}, {"chr": "chr17", "startPos": 268827, "endPos": 268828, "source": "GnomAD", "conversion": "A>C", "variantType": "SNP", "description": "", "dbSNPID": "4242410"}, {"chr": "chr17", "startPos": 289454, "endPos": 289455, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "5200883"}, {"chr": "chr17", "startPos": 244696, "endPos": 244697, "source": "ClinVar", "conversion": "A>G", "variantType": "SNP", "description": "", "dbSNPID": "3194693"}, {"chr": "chr17", "startPos": 210050, "endPos": 210051, "source": "GnomAD", "conversion": "T>C", "variantType": "SNV", "description": "", "dbSNPID": "3291768"}, {"chr": "chr17", "startPos": 213135, "endPos": 213136, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "4975767"}, {"chr": "chr17", "startPos": 233384, "endPos": 233385, "source": "dbSNP", "conversion": "C>C", "variantType": "SNP", "description": "", "dbSNPID": "8766883"}, {"chr": "chr17", "startPos": 269686, "endPos": 269687, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "308248"}, {"chr": "chr17", "startPos": 253933, "endPos": 253934, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "522052"}, {"chr": "chr17", "startPos": 248085, "endPos": 248086, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "4915582"}, {"chr": "chr17", "startPos": 291653, "endPos": 291654, "source": "GnomAD", "conversion": "A>T", "variantType": "SNV", "description": "", "dbSNPID": "6751918"}, {"chr": "chr17", "startPos": 241068, "endPos": 241069, "source": "ClinVar", "conversion": "T>C", "variantType": "SNP", "description": "", "dbSNPID": "5310799"}, {"chr": "chr17", "startPos": 253113, "endPos": 253114, "source": "GnomAD", "conversion": "T>C", "variantType": "SNP", "description": "", "dbSNPID": "2864300"}, {"chr": "chr17", "startPos": 274215, "endPos": 274216, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "8986863"}, {"chr": "chr17", "startPos": 284642, "endPos": 284643, "source": "dbSNP", "conversion": "C>C", "variantType": "SNP", "description": "", "dbSNPID": "375761"}, {"chr": "chr17", "startPos": 202282, "endPos": 202283, "source": "ClinVar", "conversion": "A>T", "variantType": "SNV", "description": "", "dbSNPID": "7203215"}, {"chr": "chr17", "startPos": 297660, "endPos": 297661, "source": "GnomAD", "conversion": "T>G", "variantType": "SNP", "description": "", "dbSNPID": "3887459"}, {"chr": "chr17", "startPos": 210868, "endPos": 210869, "source": "GnomAD", "conversion": "C>C", "variantType": "SNV", "description": "", "dbSNPID": "5845055"}, {"chr": "chr17", "startPos": 259379, "endPos": 259380, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "4410639"}, {"chr": "chr17", "startPos": 248274, "endPos": 248275, "source": "dbSNP", "conversion": "T>C", "variantType": "SNV", "description": "", "dbSNPID": "8957446"}, {"chr": "chr17", "startPos": 209228, "endPos": 209229, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "1693773"}, {"chr": "chr17", "startPos": 226615, "endPos": 226616, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "5780226"}, {"chr": "chr17", "startPos": 279976, "endPos": 279977, "source": "GnomAD", "conversion": "G>A", "variantType": "SNV", "description": "", "dbSNPID": "4226060"}, {"chr": "chr17", "startPos": 222636, "endPos": 222639, "source": "dbSNP", "conversion": "TGA", "variantType": "insertion", "description": "", "dbSNPID": "8927333"}, {"chr": "chr17", "startPos": 250082, "endPos": 250084, "source": "ClinVar", "conversion": "GC", "variantType": "insertion", "description": "", "dbSNPID": "1533523"}, {"chr": "chr17", "startPos": 221594, "endPos": 221595, "source": "GnomAD", "conversion": "A>A", "variantType": "SNP", "description": "", "dbSNPID": "2126045"}, {"chr": "chr17", "startPos": 300058, "endPos": 300065, "source": "GnomAD", "conversion": "ACTGGTT", "variantType": "insertion", "description": "", "dbSNPID": "4897905"}, {"chr": "chr17", "startPos": 228257, "endPos": 228265, "source": "ClinVar", "conversion": "TGCATCGA", "variantType": "insertion", "description": "", "dbSNPID": "6898369"}, {"chr": "chr17", "startPos": 217710, "endPos": 217715, "source": "GnomAD", "conversion": "CTCAG", "variantType": "insertion", "description": "", "dbSNPID": "7862683"}, {"chr": "chr17", "startPos": 276499, "endPos": 276500, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "5584449"}, {"chr": "chr17", "startPos": 263463, "endPos": 263464, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "7252901"}, {"chr": "chr17", "startPos": 261428, "endPos": 261435, "source": "ClinVar", "conversion": "GTTGTGT", "variantType": "insertion", "description": "", "dbSNPID": "7958360"}, {"chr": "chr17", "startPos": 291368, "endPos": 291369, "source": "ClinVar", "conversion": "T>T", "variantType": "SNV", "description": "", "dbSNPID": "4538752"}, {"chr": "chr17", "startPos": 259362, "endPos": 259363, "source": "dbSNP", "conversion": "A>T", "variantType": "SNV", "description": "", "dbSNPID": "8486191"}, {"chr": "chr17", "startPos": 201878, "endPos": 201879, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "6170561"}, {"chr": "chr17", "startPos": 242584, "endPos": 242588, "source": "dbSNP", "conversion": "GGTG", "variantType": "insertion", "description": "", "dbSNPID": "8529444"}, {"chr": "chr17", "startPos": 235409, "endPos": 235410, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "1944167"}, {"chr": "chr17", "startPos": 262400, "endPos": 262401, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "6858950"}, {"chr": "chr17", "startPos": 249922, "endPos": 249923, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "5427150"}, {"chr": "chr17", "startPos": 265293, "endPos": 265294, "source": "ClinVar", "conversion": "G>G", "variantType": "SNP", "description": "", "dbSNPID": "4173402"}, {"chr": "chr17", "startPos": 209630, "endPos": 209631, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "9737550"}, {"chr": "chr17", "startPos": 207484, "endPos": 207489, "source": "dbSNP", "conversion": "TCCTA", "variantType": "insertion", "description": "", "dbSNPID": "582909"}, {"chr": "chr17", "startPos": 211858, "endPos": 211859, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "8483654"}, {"chr": "chr17", "startPos": 298909, "endPos": 298919, "source": "GnomAD", "conversion": "ATAAGCACTG", "variantType": "insertion", "description": "", "dbSNPID": "3357559"}, {"chr": "chr17", "startPos": 239662, "endPos": 239663, "source": "dbSNP", "conversion": "C>C", "variantType": "SNP", "description": "", "dbSNPID": "1231281"}, {"chr": "chr17", "startPos": 249204, "endPos": 249205, "source": "GnomAD", "conversion": "C>A", "variantType": "SNV", "description": "", "dbSNPID": "9185253"}, {"chr": "chr17", "startPos": 291858, "endPos": 291859, "source": "dbSNP", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "4930751"}, {"chr": "chr17", "startPos": 222278, "endPos": 222279, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "969554"}, {"chr": "chr17", "startPos": 206599, "endPos": 206600, "source": "GnomAD", "conversion": "G>G", "variantType": "SNV", "description": "", "dbSNPID": "1816220"}, {"chr": "chr17", "startPos": 213795, "endPos": 213796, "source": "dbSNP", "conversion": "A>C", "variantType": "SNV", "description": "", "dbSNPID": "3650583"}, {"chr": "chr17", "startPos": 205777, "endPos": 205778, "source": "ClinVar", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "4094436"}, {"chr": "chr17", "startPos": 242886, "endPos": 242887, "source": "GnomAD", "conversion": "A>T", "variantType": "SNP", "description": "", "dbSNPID": "3312639"}, {"chr": "chr17", "startPos": 273526, "endPos": 273533, "source": "GnomAD", "conversion": "TTATAAG", "variantType": "insertion", "description": "", "dbSNPID": "261401"}, {"chr": "chr17", "startPos": 245382, "endPos": 245383, "source": "dbSNP", "conversion": "G>A", "variantType": "SNV", "description": "", "dbSNPID": "3359348"}, {"chr": "chr17", "startPos": 291767, "endPos": 291768, "source": "GnomAD", "conversion": "", "variantType": "deletion", "description": "", "dbSNPID": "4275766"}]
export const preSelectedGeneList = ['MYC', 'Beta globin', 'TBX', 'CACNA1C', 'CHRNA5', 'GRIA1', 'GRIN2A', 'BCL11A', 'SORT1', 'TERT', 'PKLR', 'MSMB', 'LDLR', 'HNF4A', 'BRCA1', 'PKLR', 'HNF1A', 'HNF4A', 'LDLR', 'LDLR', 'MYLIP', 'SCARB1', 'ABCA1', 'HNF1A', 'HNF4A', 'ARID1A', 'DENND4C/RPS6', 'PITX2', 'SCN5A/10A', 'CAV1/CAV2', 'HCN4', 'APOB', 'APOC1', 'APOE', 'LIPA', 'GATA1', 'HPRT1', 'PCNA', 'PMS2', 'MLH1', 'MSH6', 'MSH2', 'CLEC2L', 'PRSS23', 'MMP14', 'ZNF521'];

export const pseudoVariationResult = pseudoVariationResultFake1;


export const searchColorScheme = {
    "SNV": "#ff0000",
    "SNP": "#ff4000",
    "insertion": "#ffff00",
    "deletion": "#00bfff",
    "other": "#00ffbf",
}


export function geneNameSearchURLConstructor(genomeAssemly, query){
    return "https://lambda.epigenomegateway.org/v2/"+genomeAssemly+"/genes/queryName?getOnlyNames=true&q="+query
}

export function geneLocationSearchURLConstructor(genomeAssemly, query){
    return "https://lambda.epigenomegateway.org/v2/"+genomeAssemly+"/genes/queryName?isExact=true&q="+query
}

export function UCSCClinvarURLConstructor(genomeAssemly, chrom, posStart, posEnd) {

    let res = "https://api.genome.ucsc.edu/getData/track?genome=" + genomeAssemly + ";track=clinvarMain;";
    res = res + "chrom=chr" + chrom.toString() + ";";
    res += "start=" + posStart.toString() + ";";
    res += "end=" + posEnd.toString() + ";";

    return res
}

export function variantionSearchByLocationURLConstructor(genomeAssemly, chrom, posStart, posEnd) {

    let res = "https://api.genome.ucsc.edu/getData/track?genome=" + genomeAssemly + ";track=clinvarMain;";
    res = res + "chrom=chr" + chrom.toString() + ";";
    res += "start=" + posStart.toString() + ";";
    res += "end=" + posEnd.toString() + ";";

    return res
}


export function GoToEpiBrowserURLConstructorSimple(genomeAssemly, pos) {
    return "http://epigenomegateway.wustl.edu/browser/?genome=" + genomeAssemly + "&position=" + pos;
}

export function GoToEpiBrowserURLConstructor(genomeAssemly, chrom, pos_start, pos_end) {
    chrom = chrom.toString();
    if (!chrom.startsWith("chr")){
        chrom = "chr" + chrom.toString();
    }
    return GoToEpiBrowserURLConstructorSimple(genomeAssemly, chrom.toString()+":"+pos_start.toString()+"-"+pos_end.toString())
}





export function clinVarSearchByLocationURLConstructor(genomeAssemly, chrom, posStart, posEnd) {

    let res = "https://api.genome.ucsc.edu/getData/track?genome=" + genomeAssemly + ";track=clinvarMain;";
    res = res + "chrom=" + chrom.toString() + ";";
    res += "start=" + posStart.toString() + ";";
    res += "end=" + posEnd.toString() + ";";

    return res
}

export function clinVarSearchResultCleaner(d){
    let res = [];
    for (let r of d.data.clinvarMain){
        let rc = {"chr":"", "startPos":"", "endPos":"", "source":"", "conversion":"", "variantType":"", "description":"", "dbSNPID":"",}; // "":"",

        rc.chr = r.chrom
        rc.startPos = r.chromStart
        rc.endPos = r.chromEnd
        rc.source = "ClinVar"
        rc.conversion = r.name
        rc.dbSNPID = "rs"+r.snpId
        if (r.type === "single nucleotide variant"){rc.variantType = "SNV"}
        if (r.type === "Insertion"){rc.variantType = "insertion"}
        if (r.type === "Deletion"){rc.variantType = "deletion"}
        if (r.type === "Microsatellite"){rc.variantType = "other"}
        if (r.type === "Indel"){rc.variantType = "other"}
        if (r.type === "Duplication"){rc.variantType = "other"}
        if (r.type === "Inversion"){rc.variantType = "other"}
        if (r.type === "Variation"){rc.variantType = "other"}
        if (r.type === ""){rc.variantType = ""}

        if (rc.variantType == ""){console.log(r.type)}
        //console.log(r)
        //console.log(rc)
        //console.log("")
        res.push(rc)
    }
    return res
}
export function clinVarSearchResultCleaner2(d){
    let res = [];
    for (let r of d.data.clinvarMain){
        let rc = {"chr":"", "startPos":"", "endPos":"", "source":"", "conversion":"", "variantType":"", "description":"", "dbSNPID":"",}; // "":"",

        rc.chr = r.chrom
        rc.startPos = r.chromStart
        rc.endPos = r.chromEnd
        rc.source = "GnomAD"
        rc.conversion = r.name
        rc.dbSNPID = "rs"+r.snpId
        if (r.type === "single nucleotide variant"){rc.variantType = "SNV"}
        if (r.type === "Insertion"){rc.variantType = "insertion"}
        if (r.type === "Deletion"){rc.variantType = "deletion"}
        if (r.type === "Microsatellite"){rc.variantType = "other"}
        if (r.type === "Indel"){rc.variantType = "other"}
        if (r.type === "Duplication"){rc.variantType = "other"}
        if (r.type === "Inversion"){rc.variantType = "other"}
        if (r.type === "Variation"){rc.variantType = "other"}
        if (r.type === ""){rc.variantType = ""}

        if (rc.variantType == ""){console.log(r.type)}
        //console.log(r)
        //console.log(rc)
        //console.log("")
        res.push(rc)
    }
    return res
}

export function variationSearch(genomeAssemly, chrom, posStart, posEnd){

    const requestPool = [];
    let clinvarURL = clinVarSearchByLocationURLConstructor(genomeAssemly, chrom, posStart, posEnd);
    let clinvarPromise = axios.get(clinvarURL)

    let clinvarURL2 = clinVarSearchByLocationURLConstructor(genomeAssemly, chrom, posStart, posEnd);
    let clinvarPromise2 = axios.get(clinvarURL2)

    let combinedPromise = Promise.all([clinvarPromise, clinvarPromise2]);
    // combinedPromise.then((d) => {console.log(d)})

    const cleanedCombinedResult = new Promise((resolve, reject) => {

        combinedPromise.then((d) => {
            let result = [];

            result = result.concat(clinVarSearchResultCleaner(d[0]))
            result = result.concat(clinVarSearchResultCleaner2(d[1]))
            console.log(result)
            resolve(result)
        })

    });

    return cleanedCombinedResult
}




export function oneThousandGenomeVariationSearchURLConstructor(chrom, posStart, posEnd) {

    let res = "https://8z6tnsj4te.execute-api.us-east-2.amazonaws.com/dev/1000genome/region/?";
    res += "chr=" + chrom.toString() + "&";
    res += "start_pos=" + posStart.toString() + "&";
    res += "end_pos=" + posEnd.toString() + "&";

    return res
}

export function favorVariationSearchURLConstructor(chrom, posStart, posEnd) {

    let res = "https://8z6tnsj4te.execute-api.us-east-2.amazonaws.com/dev/FAVOR/region/?";
    res += "chr=" + chrom.toString() + "&";
    res += "start_pos=" + posStart.toString() + "&";
    res += "end_pos=" + posEnd.toString() + "&";

    return res
}


export function AWSLambdaFunctionBase64StringToArray(b64s){

    const strData = atob(b64s);
    const charData = strData.split("").map((x) => { return x.charCodeAt(0); });
    const binData = new Uint8Array(charData);
    return JSON.parse(pako.inflate(binData, { to: "string" }));
}


export function GeneQueryByRegion(genomeAssemly, chrom, posStart, posEnd){
    let rurl = "https://lambda.epigenomegateway.org/v2/"+genomeAssemly+"/genes/refGene/queryRegion?chr="+chrom+"&start="+posStart.toString()+"&end="+posEnd.toString()+""

    return rurl
}





