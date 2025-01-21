import React, { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CSVConverter = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const convertData = (tcgData) => {
    return tcgData.map(row => ({
      'to_address.name': `${row['FirstName']} ${row['LastName']}`,
      'to_address.company': '',
      'to_address.phone': '',
      'to_address.email': '',
      'to_address.street1': row['Address1'],
      'to_address.street2': row['Address2'] || '',
      'to_address.city': row['City'],
      'to_address.state': row['State'],
      'to_address.zip': row['PostalCode'],
      'to_address.country': row['Country'],
      'from_address.name': '',
      'from_address.company': '',
      'from_address.phone': '',
      'from_address.email': '',
      'from_address.street1': '',
      'from_address.street2': '',
      'from_address.city': '',
      'from_address.state': '',
      'from_address.zip': '',
      'from_address.country': 'US',
      'parcel.length': '',
      'parcel.width': '',
      'parcel.height': '',
      'parcel.weight': Math.ceil(row['Product Weight'] * 16), // Convert to ounces
      'parcel.predefined_package': '',
      'carrier': '',
      'service': ''
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    setError('');
    setSuccess('');
  };

  const handleConvert = () => {
    if (!file) {
      setError('Please upload a TCGplayer CSV file first');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        Papa.parse(e.target.result, {
          header: true,
          complete: (results) => {
            const convertedData = convertData(results.data);
            
            // Generate the new CSV
            const csv = Papa.unparse(convertedData);
            
            // Create and trigger download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'easypost_shipments.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setSuccess('Conversion successful! Download should begin automatically.');
          },
          error: (error) => {
            setError('Error parsing CSV: ' + error.message);
          }
        });
      } catch (error) {
        setError('Error processing file: ' + error.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">TCGplayer to EasyPost Converter</h1>
        <p className="text-gray-600">Convert your TCGplayer shipping data to EasyPost format</p>
      </div>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
          <div className="flex justify-center">
            <Upload className="h-12 w-12 text-gray-400" />
          </div>
          <div>
            <label className="bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600">
              Choose TCGplayer CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
          {file && (
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>

        <button
          onClick={handleConvert}
          disabled={!file}
          className="w-full bg-green-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          <span>Convert and Download</span>
        </button>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertTitle>Success!</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="text-sm text-gray-600 space-y-2">
        <h2 className="font-semibold">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Choose TCGplayer CSV" to upload your TCGplayer shipping export file</li>
          <li>Click "Convert and Download" to transform the data</li>
          <li>Your converted file will download automatically as "easypost_shipments.csv"</li>
        </ol>
      </div>
    </div>
  );
};

export default CSVConverter;