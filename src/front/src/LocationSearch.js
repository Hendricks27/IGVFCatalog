

import React, {useEffect, useState} from "react";
import {UCSCClinvarURLConstructor, availableGenomeAndDataset, variationSearch} from "./API";
import {
    Empty,
    GenomeAssemblySelection,
    LocationSearchResult,
    LocationSearchResultContainer,
    LocationSearchStatGraph
} from "./Module";


export function LocationSearch(props){

    const urlParams = props.urlParams;
    let locationtmp = "chr1:167050000-167060000";
    let searchCountTmp = 0;
    if (urlParams.get('location') != null){
        locationtmp = urlParams.get('location')
        searchCountTmp = 1;
    }

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?location"
    )


    const [searchCount, setSearchCount] = useState(searchCountTmp);
    const [genomicLocation, setGenomicLocation] = useState(locationtmp);

    const [availableDatasetByGenomeAssembly, setAvailableDatasetByGenomeAssembly] = useState(availableGenomeAndDataset);
    const [genomeAssembly, setGenomeAssembly] = useState("hg38");
    const [selectedDataset, setSelectedDataset] = useState({});

    window.history.pushState(
        {},
        '',
        window.location.protocol + '//' + window.location.host + window.location.pathname + "?location="+genomicLocation
    )

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    return (
        <div>
            <h2 className={"pageTitle"}>Location Search</h2>
            <div  className={"searchContainer"}>
                <p>Seach variation by genomic regions: </p>

                <div>
                    <GenomeAssemblySelection
                        genomeAssembly={genomeAssembly}
                        setGenomeAssembly={setGenomeAssembly}
                        availableDatasetByGenomeAssembly={availableDatasetByGenomeAssembly}
                        setAvailableDatasetByGenomeAssembly={setAvailableDatasetByGenomeAssembly}
                        selectedDataset={selectedDataset}
                        setSelectedDataset={setSelectedDataset}
                    />

                    <form onSubmit={handleSubmit}>

                        <label>Location: </label>
                        <input type={"text"} value={genomicLocation} onChange={(e) => {setGenomicLocation(e.target.value)}} />

                        <Empty /> <button onClick={ () => { setSearchCount(searchCount+1); }} >Search</button>
                    </form>
                </div>



            </div>

            {searchCount > 0 ? <LocationSearchResultContainer genomeAssembly={genomeAssembly} genomicLocation={genomicLocation} searchCount={searchCount} /> : <Empty /> }


        </div>
    )
}


