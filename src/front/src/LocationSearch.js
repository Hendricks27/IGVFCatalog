

import React, {useEffect, useState} from "react";
import {UCSCClinvarURLConstructor, availableGenomeAndDataset} from "./API";
import {Empty, GenomeAssemblySelection, LocationSearchResult} from "./Module";



export function LocationSearch(props){

    const [searchCount, setSearchCount] = useState(0);
    const [genomicLocation, setGenomicLocation] = useState("chr3:1200000-2500000");

    const [availableDatasetByGenomeAssembly, setAvailableDatasetByGenomeAssembly] = useState(availableGenomeAndDataset);
    const [genomeAssembly, setGenomeAssembly] = useState("hg38");
    const [selectedDataset, setSelectedDataset] = useState({});


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

            <div className={"resultContainer"}>
                {searchCount > 0 ? <LocationSearchResult genomeAssembly={genomeAssembly} genomicLocation={genomicLocation} searchCount={searchCount} /> : <Empty /> }
            </div>
        </div>
    )
}


