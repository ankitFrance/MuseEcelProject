const xlsx = require('xlsx');
const fs = require('fs');


//*###################################################################################################################### */
//Read the csv file and extract the 'reference id' from JSON and store the in an array

let recordCount = 0;

// Reading CSV file 
const fileContent = fs.readFileSync('museofile.csv', 'utf-8');

// Splitting lines 
const lines = fileContent.trim().split('\n');




// Array to store the reference ID in csv file
let extractedValues = [];

// Processing each line 
// i = 1 because need to skip the header
for (let i = 1; i < lines.length; i++) {
    
    //To get a line
    const line = lines[i];
    // Splitting each line by tab character to get columns
    const columns = line.split('\t');
    // Extracting the second column (index 1) which contains the reference ID
    const value = columns[1].trim(); 
   
    extractedValues.push(value);

    recordCount++;
}


// This has all the reference ID of the csv file
console.log(extractedValues);

//*######################################################################################################"################## */
// Fetching of data from JSON


 async function fetchData(extractedValues) {
    let allCodeMuseofiles = []; 
    try {
        
        for (const value of extractedValues) {
            const url = `https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/base-joconde-extrait/records?select=*&where=reference%20like%20%22${value}%22`;
            const response = await fetch(url);
            const jsonData = await response.json();
            const codeMuseofiles = jsonData.results.map(result => result.code_museofile);
            console.log(`Code Museofiles for ${value}:`, codeMuseofiles);

            if (codeMuseofiles.length === 0) {
                allCodeMuseofiles.push('');
            } else {
                allCodeMuseofiles = [...allCodeMuseofiles, ...codeMuseofiles]; 
            }  
            
         }

         console.log(allCodeMuseofiles); 

         writeToCSV(allCodeMuseofiles);

         return allCodeMuseofiles;

    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

fetchData(extractedValues);


//*######################################################################################################"################## */
// Writing to CSV


function writeToCSV(data) {
    const fileContent = fs.readFileSync('museofile.csv', 'utf-8');
    const lines = fileContent.trim().split('\n');

    // to insert museoFile ID in the top column
    const headerColumns = lines[0].split('\t');
    headerColumns[4] = 'museoFile ID';
    lines[0] = headerColumns.join('\t');
   
    
    // Modify the lines array to add data to the 5th column
    for (let i = 1; i < lines.length && i <= data.length; i++) {
        const line = lines[i];
        const columns = line.split('\t');
        
    
        
        // Append data to the 4th column
        columns[3] = data[i - 1]; // Use data[i - 1] directly since i starts from 1 for lines
        
        lines[i] = columns.join('\t');
    }

    // Join lines back into a single string and write back to file
    const updatedContent = lines.join('\n');
    fs.writeFileSync('museofile.csv', updatedContent, 'utf-8');
}


//*###############################################################################################################